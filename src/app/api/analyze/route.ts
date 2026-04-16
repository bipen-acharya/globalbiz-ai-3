import { NextRequest, NextResponse } from 'next/server'
import { generateAnalysis } from '@/lib/openai'
import { fetchNearbyCompetitors } from '@/lib/maps'
import { runScoringEngine } from '@/lib/scoring-engine'
import type { BusinessFormData, AnalyzeSuccessResponse, AnalyzeErrorResponse } from '@/types'
import { getEffectiveBusinessType } from '@/lib/australia-business-rules'
import { normalizeReportInput } from '@/lib/report-input'

const LIMIT = parseInt(process.env.DAILY_REPORT_LIMIT ?? '10', 10)

function jsonError(msg: string, status: number): NextResponse<AnalyzeErrorResponse> {
  return NextResponse.json<AnalyzeErrorResponse>({ success: false, error: msg }, { status })
}

async function getDB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAndIncrementUsage(today: string): Promise<boolean> {
  let db
  try { db = await getDB() } catch { return true }

  const { data, error } = await db
    .from('daily_usage').select('id, count, limit_val').eq('usage_date', today).maybeSingle()
  if (error) return true

  if (data) {
    if (data.count >= (data.limit_val ?? LIMIT)) return false
    await db.from('daily_usage').update({ count: data.count + 1 }).eq('id', data.id)
    return true
  }

  const { error: insErr } = await db
    .from('daily_usage').insert({ usage_date: today, count: 1, limit_val: LIMIT })
  if (insErr) {
    const { data: raced } = await db
      .from('daily_usage').select('id, count, limit_val').eq('usage_date', today).maybeSingle()
    if (raced) {
      if (raced.count >= (raced.limit_val ?? LIMIT)) return false
      await db.from('daily_usage').update({ count: raced.count + 1 }).eq('id', raced.id)
    }
  }
  return true
}

async function saveReport(form: BusinessFormData, analysis: object, today: string): Promise<string | null> {
  let db
  try { db = await getDB() } catch { return null }

  const effectiveBusinessType = getEffectiveBusinessType(form)

  const { data, error } = await db
    .from('reports')
    .insert({
      business_model_type: form.business_model_type,
      country:             'Australia',
      state_province:      form.state,
      city:                form.city,
      suburb:              form.suburb || null,
      postcode:            form.postcode || null,
      radius_km:           form.radius_km,
      lat:                 form.lat || null,
      lng:                 form.lng || null,
      business_type:       effectiveBusinessType,
      products_services:   form.products_services,
      avg_price_range:     form.avg_price_range || null,
      startup_budget:      form.startup_budget || null,
      staff_count:         form.staff_count,
      operating_hours:     form.operating_hours || null,
      target_customers:    form.target_customers.join(', ') || null,
      target_market:       form.target_market || null,
      ad_budget_monthly:   form.ad_budget_monthly || null,
      delivery_coverage:   form.delivery_coverage === 'Custom coverage' ? form.delivery_coverage_custom || form.delivery_coverage : form.delivery_coverage || null,
      community_type:      form.community_type || null,
      income_level:        form.income_level || null,
      target_age_group:    form.target_age_groups.join(', ') || null,
      audience_type:       form.audience_types.join(', ') || null,
      delivery_needed:     form.delivery_needed,
      expected_revenue:    form.expected_revenue || null,
      launch_timeline:     form.launch_timeline || null,
      growth_goal:         form.growth_goal || null,
      risk_tolerance:      form.risk_tolerance || null,
      analysis,
      usage_date:          today,
    })
    .select('id').single()

  if (error) { console.error('[save]', error.message); return null }
  return data?.id ?? null
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  // 1. Parse
  let form: BusinessFormData
  try {
    if (!(req.headers.get('content-type') ?? '').includes('application/json'))
      return jsonError('Content-Type must be application/json', 400)
    form = normalizeReportInput(await req.json())
  } catch { return jsonError('Invalid JSON body', 400) }

  // 2. Validate
  const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
  const isOnline = form.business_model_type === 'online' || form.business_model_type === 'hybrid'

  if (!form.user_goal_mode) return jsonError('user_goal_mode is required', 422)
  if (!form.state?.trim()) return jsonError('state is required', 422)
  if (isPhysical && !form.suburb?.trim()) return jsonError('suburb is required for physical or hybrid businesses', 422)
  if (isOnline && !form.delivery_coverage?.trim()) return jsonError('delivery_coverage is required for online or hybrid businesses', 422)
  if (form.delivery_coverage === 'Custom coverage' && !form.delivery_coverage_custom?.trim()) return jsonError('delivery_coverage_custom is required', 422)
  if (!form.business_type?.trim()) return jsonError('business_type is required', 422)
  if (form.business_type === 'Other' && !form.business_type_other?.trim()) return jsonError('business_type_other is required when business_type is Other', 422)
  if (form.user_goal_mode === 'start_new' && !form.business_concept?.trim()) return jsonError('business_concept is required', 422)
  if (!form.products_services?.trim()) return jsonError('products_services is required', 422)
  if (!form.avg_price_range?.trim()) return jsonError('avg_price_range is required', 422)
  if (form.user_goal_mode === 'start_new' && (!Array.isArray(form.target_customers) || form.target_customers.length === 0)) return jsonError('target_customers is required', 422)
  if (form.user_goal_mode === 'start_new' && parseInt(form.expected_revenue?.replace(/\D/g, '') || '0', 10) <= 0) return jsonError('expected_revenue must be greater than 0', 422)
  if (form.user_goal_mode === 'start_new' && parseInt(form.startup_budget?.replace(/\D/g, '') || '0', 10) <= 0) return jsonError('startup_budget must be greater than 0', 422)
  if (form.user_goal_mode === 'grow_existing' && parseInt(form.current_monthly_revenue?.replace(/\D/g, '') || '0', 10) <= 0) return jsonError('current_monthly_revenue must be greater than 0', 422)
  if (form.user_goal_mode === 'grow_existing' && (!Array.isArray(form.current_challenges) || form.current_challenges.length === 0)) return jsonError('current_challenges is required', 422)
  if (form.user_goal_mode === 'grow_existing' && !form.growth_strategy_type?.trim()) return jsonError('growth_strategy_type is required', 422)
  if (form.user_goal_mode === 'grow_existing' && !form.current_location_suburb?.trim()) return jsonError('current_location_suburb is required', 422)
  if (form.user_goal_mode === 'grow_existing' && !form.business_name?.trim()) return jsonError('business_name is required', 422)

  // 3. Daily cap
  const today = new Date().toISOString().split('T')[0]
  const allowed = await checkAndIncrementUsage(today)
  if (!allowed) return jsonError('DAILY_LIMIT_REACHED', 429)

  // 4. Fetch real nearby competitors
  let nearby = null
  try {
    const effectiveBusinessType = getEffectiveBusinessType(form)
    if (isPhysical) {
      nearby = await fetchNearbyCompetitors({
        lat: form.lat,
        lng: form.lng,
        radiusKm: form.radius_km || 3,
        businessType: effectiveBusinessType,
        businessModelType: form.business_model_type,
        productsServices: form.products_services,
        suburb: form.suburb || form.city || '',
        state: form.state,
        postcode: form.postcode,
      })
    } else {
      nearby = await fetchNearbyCompetitors({
        lat: form.lat,
        lng: form.lng,
        radiusKm: form.radius_km || 5,
        businessType: effectiveBusinessType,
        businessModelType: form.business_model_type,
        productsServices: form.products_services,
        suburb: form.target_market || form.state,
        state: form.state,
        postcode: form.postcode,
      })
    }
  } catch (err) {
    console.warn('[route] competitor fetch error:', err)
  }

  // 5. Run scoring engine — formula-driven, no static seeds
  const scores = runScoringEngine({ form, nearby })

  // 6. Generate AI analysis (scores are pre-locked, AI only writes text)
  let analysis
  try {
    analysis = await generateAnalysis(form, nearby, scores)
  } catch (err) {
    console.error('[route] generateAnalysis error:', err)
    return jsonError('Failed to generate analysis. Please try again.', 500)
  }

  // 7. Save
  let reportId = await saveReport(form, analysis, today)
  const usingTempId = !reportId
  if (!reportId) reportId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  return NextResponse.json<AnalyzeSuccessResponse>({
    success: true,
    reportId,
    report: analysis,
    _temp: usingTempId,
  })
}

export async function GET(): Promise<NextResponse<AnalyzeErrorResponse>> {
  return jsonError('Method not allowed. Use POST.', 405)
}
