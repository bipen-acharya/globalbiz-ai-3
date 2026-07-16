// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze-existing
// Controller: existing business turnaround/growth report.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { fetchNearbyCompetitors, geocodeSuburb } from '@/lib/maps'
import { runScoringEngine } from '@/lib/scoring-engine'
import { generateExistingAnalysis } from '@/services/analysisService'
import { checkAndRecordReport } from '@/services/usageStore'
import { notifyReportGenerated } from '@/services/notifyService'
import { activeProvider } from '@/services/aiClient'
import { mapExistingFormToScoringForm } from '@/services/formMappers'
import type { ExistingBusinessFormData, AnalyzeSuccessResponse, AnalyzeErrorResponse } from '@/types'

function jsonError(msg: string, status: number): NextResponse<AnalyzeErrorResponse> {
  return NextResponse.json<AnalyzeErrorResponse>({ success: false, error: msg }, { status })
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  if (activeProvider() === 'none') {
    return jsonError('Service not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.', 500)
  }

  let form: ExistingBusinessFormData
  try {
    if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
      return jsonError('Content-Type must be application/json', 400)
    }
    form = await req.json() as ExistingBusinessFormData
  } catch { return jsonError('Invalid JSON body', 400) }

  // Validate
  if (!form.business_name?.trim()) return jsonError('business_name is required', 422)
  if (!form.business_type?.trim()) return jsonError('business_type is required', 422)
  if (!form.situation_description?.trim()) return jsonError('situation_description is required', 422)

  const locationType = form.location_type ?? 'physical'
  const needsAddress = locationType === 'physical' || locationType === 'both'
  if (needsAddress && !form.suburb?.trim()) return jsonError('suburb is required for physical businesses', 422)
  if (!form.state?.trim()) return jsonError('state is required', 422)

  // Usage caps — lifetime beta cap + daily cost protection
  const usage = await checkAndRecordReport()
  if (!usage.allowed) return jsonError(usage.reason, 429)

  // Resolve coordinates
  let lat = form.lat
  let lng = form.lng
  if (needsAddress && (!lat || !lng) && form.suburb && form.state) {
    try {
      const coords = await geocodeSuburb(form.suburb, form.state, form.postcode ?? '')
      lat = coords.lat
      lng = coords.lng
      form = { ...form, lat, lng }
    } catch (err) {
      console.warn('[analyze-existing] geocode failed:', err)
    }
  }

  // Competitors
  let nearby = null
  if (needsAddress) {
    try {
      nearby = await fetchNearbyCompetitors({
        lat,
        lng,
        radiusKm: form.radius_km ?? 10,
        businessType: form.business_type,
        suburb: form.suburb,
        state: form.state,
        postcode: form.postcode,
      })
    } catch (err) {
      console.warn('[analyze-existing] competitor fetch error:', err)
    }
  }

  const scoringForm = mapExistingFormToScoringForm(form, lat, lng)
  const scores = runScoringEngine({ form: scoringForm, nearby })

  let analysis
  try {
    analysis = await generateExistingAnalysis(form, nearby, scores)
  } catch (err) {
    console.error('[analyze-existing] failed:', err)
    return jsonError('Failed to generate analysis. Please try again.', 500)
  }

  const reportId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // Admin alert — fire and forget, never blocks the response
  void notifyReportGenerated({
    flow: 'Existing business',
    businessType: form.business_type,
    businessName: form.business_name,
    state: form.state,
    suburb: form.suburb,
    topScores: [
      { label: 'Current health', value: scores.success_score },
      { label: 'Opportunity gap', value: scores.opportunity_gap_score },
      { label: 'Failure risk', value: scores.failure_risk_score },
    ],
    totalReports: usage.total,
    totalLimit: usage.totalLimit,
  })

  return NextResponse.json<AnalyzeSuccessResponse>({
    success: true,
    reportId,
    report: analysis,
    _temp: true,
  })
}

export async function GET(): Promise<NextResponse<AnalyzeErrorResponse>> {
  return jsonError('Method not allowed. Use POST.', 405)
}
