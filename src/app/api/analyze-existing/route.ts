import { NextRequest, NextResponse } from 'next/server'
import { fetchNearbyCompetitors, geocodeSuburb } from '@/lib/maps'
import { runScoringEngine } from '@/lib/scoring-engine'
import { generateExistingAnalysis } from '@/lib/openai-existing'
import type { ExistingBusinessFormData, BusinessFormData, AnalyzeSuccessResponse, AnalyzeErrorResponse } from '@/types'

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

async function saveReport(
  form: ExistingBusinessFormData,
  analysis: object,
  today: string
): Promise<string | null> {
  let db
  try { db = await getDB() } catch { return null }

  const { data, error } = await db
    .from('reports')
    .insert({
      report_type:          'existing',
      business_model_type:  'physical',
      country:              'Australia',
      state_province:       form.state,
      city:                 form.city,
      suburb:               form.suburb || null,
      postcode:             form.postcode || null,
      radius_km:            3,
      lat:                  form.lat || null,
      lng:                  form.lng || null,
      business_type:        form.business_type,
      business_name:        form.business_name || null,
      staff_count:          form.staff_count,
      analysis,
      usage_date:           today,
    })
    .select('id').single()

  if (error) { console.error('[analyze-existing save]', error.message); return null }
  return data?.id ?? null
}

// ── Map ExistingBusinessFormData → BusinessFormData for scoring engine ─────────
function mapToScoringForm(form: ExistingBusinessFormData, lat: number | null, lng: number | null): BusinessFormData {
  const revenueNum = parseInt(form.current_revenue?.replace(/\D/g, '') || '0', 10)
  const budgetNum = parseInt(form.change_budget?.replace(/\D/g, '') || '0', 10)

  return {
    user_goal_mode:               'grow_existing',
    business_name:                form.business_name,
    business_concept:             form.description,
    business_model_type:          'physical',
    state:                        form.state,
    suburb:                       form.suburb,
    postcode:                     form.postcode,
    city:                         form.city,
    lat,
    lng,
    suburb_profile:               null,
    radius_km:                    3,
    business_type:                form.business_type,
    business_type_other:          '',
    products_services:            form.description,
    avg_price_range:              '',
    startup_budget:               String(budgetNum),
    staff_count:                  form.staff_count,
    operating_hours:              '',
    operating_schedule:           [],
    target_customers:             [],
    target_market:                '',
    ad_budget_monthly:            '',
    delivery_coverage:            '',
    delivery_coverage_custom:     '',
    demand_zone_type:             '',
    delivery_zone_importance:     '',
    anchor_locations:             [],
    community_type:               '',
    income_level:                 '',
    target_age_groups:            [],
    audience_types:               [],
    delivery_needed:              false,
    lunch_dinner_demand:          '',
    weekend_traffic_level:        '',
    online_ordering_importance:   '',
    foot_traffic_expectation:     '',
    expected_revenue:             String(revenueNum),
    launch_timeline:              form.timeline,
    growth_goal:                  form.owner_goal,
    supply_model:                 '',
    launch_inventory_assumption:  '',
    break_even_expectation:       '',
    strategic_goals:              [],
    risk_tolerance:               'medium',
    current_monthly_revenue:      String(revenueNum),
    target_monthly_revenue:       '',
    current_challenges:           form.problems,
    current_customer_type:        '',
    existing_online_presence:     form.website_url || form.social_handles ? 'Basic' : 'None',
    expansion_goal:               form.owner_goal,
    growth_strategy_type:         form.owner_goal.includes('Expand') ? 'Open a second location' : form.owner_goal.includes('Pivot') ? 'Pivot to a new product or service' : 'Improve current site performance',
    new_suburb_expansion:         form.owner_goal.includes('second location'),
    delivery_expansion:           false,
    business_age_band:            form.years_operating,
    years_in_business:            form.years_operating.includes('5+') ? 6 : form.years_operating.includes('3–5') ? 4 : form.years_operating.includes('1–3') ? 2 : 0,
    current_location_suburb:      form.suburb,
    premises_type:                'leased',
    current_team_size:            form.staff_count,
    average_daily_customers:      0,
    repeat_customer_rate:         30,
    average_basket_value:         '',
    best_selling_offer_price:     '',
    premium_upsell_price:         '',
    monthly_fixed_costs:          '',
    monthly_staff_costs:          '',
    average_gross_margin:         40,
    best_selling_products:        [],
    worst_performing_products:    [],
    busiest_trading_days:         [],
    quietest_trading_days:        [],
    best_traffic_channels:        [],
    best_converting_offers:       [],
    lead_sources:                 [],
    peak_enquiry_periods:         [],
    strongest_acquisition_channels: [],
    average_google_rating:        '',
    google_review_count:          0,
    social_media_channels:        form.social_handles ? ['Instagram'] : [],
    website_conversion_quality:   form.website_url ? 'Basic' : 'None',
    delivery_platform_usage:      [],
    supplier_dependency_risk:     'medium',
    website_url:                  form.website_url,
    instagram_url:                '',
    facebook_url:                 '',
    tiktok_url:                   '',
    google_business_profile_url:  form.google_maps_url,
    linkedin_url:                 '',
    average_monthly_website_visitors: 0,
    instagram_followers:          0,
    average_post_engagement:      0,
    average_weekly_enquiries:     0,
    conversion_rate:              0,
    delivery_order_percentage:    0,
    walk_in_percentage:           80,
    customer_lifetime_estimate:   '',
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeSuccessResponse | AnalyzeErrorResponse>> {
  // 1. Parse
  let form: ExistingBusinessFormData
  try {
    if (!(req.headers.get('content-type') ?? '').includes('application/json'))
      return jsonError('Content-Type must be application/json', 400)
    form = await req.json() as ExistingBusinessFormData
  } catch { return jsonError('Invalid JSON body', 400) }

  // 2. Validate required fields
  if (!form.business_name?.trim()) return jsonError('business_name is required', 422)
  if (!form.business_type?.trim()) return jsonError('business_type is required', 422)
  if (!form.state?.trim()) return jsonError('state is required', 422)
  if (!form.suburb?.trim()) return jsonError('suburb is required', 422)
  if (!form.situation_description?.trim()) return jsonError('situation_description is required', 422)

  // 3. Daily cap
  const today = new Date().toISOString().split('T')[0]
  const allowed = await checkAndIncrementUsage(today)
  if (!allowed) return jsonError('DAILY_LIMIT_REACHED', 429)

  // 4. Resolve coordinates — use provided lat/lng, or geocode from suburb+state
  let lat = form.lat
  let lng = form.lng

  if (!lat || !lng) {
    try {
      const coords = await geocodeSuburb(form.suburb, form.state, form.postcode ?? '')
      lat = coords.lat
      lng = coords.lng
      form = { ...form, lat, lng }
    } catch (err) {
      console.warn('[analyze-existing] geocode failed:', err)
    }
  }

  // 5. Fetch nearby competitors
  let nearby = null
  try {
    nearby = await fetchNearbyCompetitors({
      lat,
      lng,
      radiusKm: 3,
      businessType: form.business_type,
      suburb: form.suburb,
      state: form.state,
      postcode: form.postcode,
    })
  } catch (err) {
    console.warn('[analyze-existing] competitor fetch error:', err)
  }

  // 6. Run scoring engine using mapped form shape
  const scoringForm = mapToScoringForm(form, lat, lng)
  const scores = runScoringEngine({ form: scoringForm, nearby })

  // 7. Generate turnaround analysis
  let analysis
  try {
    analysis = await generateExistingAnalysis(form, nearby, scores)
  } catch (err) {
    console.error('[analyze-existing] generateExistingAnalysis error:', err)
    return jsonError('Failed to generate analysis. Please try again.', 500)
  }

  // 8. Save to Supabase
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
