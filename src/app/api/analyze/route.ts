// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze
// Controller: validates input, runs scoring + AI analysis, returns the report.
// No persistence — client stores the report in sessionStorage.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { generateAnalysis } from '@/services/analysisService'
import { fetchNearbyCompetitors } from '@/lib/maps'
import { runScoringEngine } from '@/lib/scoring-engine'
import { checkAndRecordReport } from '@/services/usageStore'
import { notifyReportGenerated } from '@/services/notifyService'
import { activeProvider } from '@/services/aiClient'
import { normalizeReportInput } from '@/lib/report-input'
import { getEffectiveBusinessType } from '@/lib/australia-business-rules'
import type { BusinessFormData, AnalyzeSuccessResponse, AnalyzeErrorResponse } from '@/types'

function jsonError(msg: string, status: number): NextResponse<AnalyzeErrorResponse> {
  return NextResponse.json<AnalyzeErrorResponse>({ success: false, error: msg }, { status })
}

function validate(form: BusinessFormData): string | null {
  const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
  const isOnline = form.business_model_type === 'online' || form.business_model_type === 'hybrid'

  if (!form.user_goal_mode) return 'user_goal_mode is required'
  if (!form.state?.trim()) return 'state is required'
  if (isPhysical && !form.suburb?.trim()) return 'suburb is required for physical or hybrid businesses'
  if (isOnline && !form.delivery_coverage?.trim()) return 'delivery_coverage is required for online or hybrid businesses'
  if (form.delivery_coverage === 'Custom coverage' && !form.delivery_coverage_custom?.trim()) return 'delivery_coverage_custom is required'
  if (!form.business_type?.trim()) return 'business_type is required'
  if (form.user_goal_mode === 'start_new' && !form.business_concept?.trim()) return 'business_concept is required'
  if (!form.products_services?.trim()) return 'products_services is required'
  if (!form.avg_price_range?.trim()) return 'avg_price_range is required'
  if (form.user_goal_mode === 'start_new') {
    if (!Array.isArray(form.target_customers) || form.target_customers.length === 0) return 'target_customers is required'
    if (parseInt(form.expected_revenue?.replace(/\D/g, '') || '0', 10) <= 0) return 'expected_revenue must be greater than 0'
    if (parseInt(form.startup_budget?.replace(/\D/g, '') || '0', 10) <= 0) return 'startup_budget must be greater than 0'
  }
  return null
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  if (activeProvider() === 'none') {
    return jsonError('Service not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.', 500)
  }

  let form: BusinessFormData
  try {
    if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
      return jsonError('Content-Type must be application/json', 400)
    }
    form = normalizeReportInput(await req.json())
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const validationError = validate(form)
  if (validationError) return jsonError(validationError, 422)

  // Usage caps — lifetime beta cap + daily cost protection
  const usage = await checkAndRecordReport()
  if (!usage.allowed) return jsonError(usage.reason, 429)

  // Fetch real nearby competitors
  let nearby = null
  try {
    const effectiveBusinessType = getEffectiveBusinessType(form)
    const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
    nearby = await fetchNearbyCompetitors({
      lat: form.lat,
      lng: form.lng,
      radiusKm: form.radius_km || (isPhysical ? 3 : 5),
      businessType: effectiveBusinessType,
      businessModelType: form.business_model_type,
      productsServices: form.products_services,
      suburb: (isPhysical ? form.suburb || form.city : form.target_market || form.state) ?? '',
      state: form.state,
      postcode: form.postcode,
    })
  } catch (err) {
    console.warn('[analyze] competitor fetch error:', err)
  }

  // Scoring (formula-driven)
  const scores = runScoringEngine({ form, nearby })

  // AI analysis (text only — scores are locked)
  let analysis
  try {
    analysis = await generateAnalysis(form, nearby, scores)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyze] generateAnalysis failed:', msg)
    return jsonError('Failed to generate analysis. Please try again.', 500)
  }

  const reportId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // Admin alert — fire and forget, never blocks the response
  void notifyReportGenerated({
    flow: 'New business',
    businessType: form.business_type,
    state: form.state,
    suburb: form.suburb,
    topScores: [
      { label: 'Viability', value: scores.success_score },
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
