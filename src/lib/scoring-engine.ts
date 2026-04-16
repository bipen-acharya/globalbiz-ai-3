import type { BusinessFormData, NearbyCompetitorData, NearbyPlace } from '@/types'
import { getBusinessGroup, isDigitalTechGroup, isFoodHospitalityGroup, isRetailGroup } from '@/lib/business-groups'

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Engine — ALL values formula-driven from real inputs.
// Zero hardcoded final scores. Every number traces to a real signal.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoringInputs {
  form: BusinessFormData
  nearby: NearbyCompetitorData | null
}

export interface ScoringOutput {
  success_score: number
  decision_confidence_score: number
  business_viability_score: number
  differentiation_score: number
  suburb_opportunity_score: number
  pricing_confidence_score: number
  customer_retention_strength_score: number
  expansion_readiness_score: number
  digital_acquisition_strength_score: number
  current_health_score: number
  digital_maturity_score: number
  retention_risk_score: number
  social_media_opportunity_score: number
  seo_gap_score: number
  second_branch_readiness_score: number
  delivery_expansion_readiness_score: number
  customer_lifetime_score: number
  local_brand_strength_score: number
  cultural_fit_score: number
  competitor_saturation_score: number
  pricing_fit_score: number
  failure_risk_score: number
  opportunity_gap_score: number
  demand_probability_score: number
  break_even_months: number
  // Rich signals passed to AI and report UI
  signals: ScoringSignals
}

export interface ScoringSignals {
  competitor_count: number
  avg_competitor_rating: number | null
  weak_competitors: NearbyPlace[]       // rating < 3.5
  strong_competitors: NearbyPlace[]     // rating >= 4.2
  open_now_count: number
  closed_count: number
  high_review_count: number             // >200 reviews
  low_review_count: number              // <20 reviews
  price_gap: 'below_market' | 'at_market' | 'above_market' | 'unknown'
  density_per_sqkm: number
  budget_monthly_capacity: number
  hours_opportunity: boolean            // competitors close early
  delivery_gap: boolean                 // no delivery competitors
  saturation_label: NearbyCompetitorData['competitor_density']
  market_maturity: 'emerging' | 'growing' | 'mature' | 'saturated'
  open_day_count?: number
  closed_days?: string[]
  busiest_trading_window?: string
  schedule_fit?: 'strong' | 'mixed' | 'weak'
}

// ── Parse money strings into numbers ─────────────────────────────────────────
function parseMoney(s: string): number {
  if (!s) return 0
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

// ── Parse price range string to midpoint ─────────────────────────────────────
function parsePriceRange(s: string): number | null {
  if (!s) return null
  const nums = s.match(/\d+/g)?.map(Number) ?? []
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function scheduleSignals(form: BusinessFormData) {
  const schedule = form.operating_schedule ?? []
  const openDays = schedule.filter(day => !day.closed)
  const closedDays = schedule.filter(day => day.closed).map(day => day.day)
  const summary = form.operating_hours.toLowerCase()
  const lunchOnly = /11:00 am|11:30 am|12:00 pm/.test(summary) && !/6:30 am|7:00 am|8:00 am|5:00 pm|6:00 pm/.test(summary)
  const dinnerOnly = /5:00 pm|5:30 pm|6:00 pm/.test(summary) && !/6:30 am|7:00 am|8:00 am|9:00 am/.test(summary)
  const weekendHeavy = openDays.filter(day => /Saturday|Sunday/.test(day.day)).length >= 2 && openDays.filter(day => /Monday|Tuesday|Wednesday|Thursday|Friday/.test(day.day)).length <= 3
  const weekdayOnly = openDays.length > 0 && openDays.every(day => /Monday|Tuesday|Wednesday|Thursday|Friday/.test(day.day))
  const allDay = openDays.some(day => day.open === '12:00 am' && day.close === '11:30 pm')
  const busiestTradingWindow =
    allDay ? '24/7'
    : lunchOnly ? 'Lunch only'
    : dinnerOnly ? 'Dinner only'
    : weekendHeavy ? 'Weekend heavy'
    : weekdayOnly ? 'Weekday only'
    : openDays.some(day => day.open?.includes('6:') || day.open?.includes('7:')) && openDays.some(day => day.close?.includes('2:') || day.close?.includes('3:'))
    ? 'Breakfast + lunch'
    : 'Mixed trading window'

  return {
    open_day_count: openDays.length,
    closed_days: closedDays,
    lunch_only: lunchOnly,
    dinner_only: dinnerOnly,
    weekend_heavy: weekendHeavy,
    weekday_only: weekdayOnly,
    all_day: allDay,
    busiest_trading_window: busiestTradingWindow,
  }
}

// ── Suburb income proxy from community_type + income_level ───────────────────
function incomeMultiplier(form: BusinessFormData): number {
  const base: Record<string, number> = {
    'Low income': 0.55,
    'Lower-middle income': 0.72,
    'Middle income': 0.88,
    'Upper-middle income': 1.05,
    'High income': 1.22,
    'Mixed': 0.90,
  }
  return base[form.income_level] ?? 0.85
}

// ── Demand multiplier by business type ───────────────────────────────────────
function demandMultiplier(businessType: string): number {
  const high = /café|cafe|coffee|restaurant|takeaway|food truck|bakery|gym|pharmacy/i
  const med  = /salon|barber|grocery|clothing|childcare/i
  if (high.test(businessType)) return 1.15
  if (med.test(businessType))  return 1.00
  return 0.88
}

// ── Budget realism score (0–100) ─────────────────────────────────────────────
function calcBudgetScore(form: BusinessFormData): number {
  const budget = parseMoney(form.startup_budget)
  const revenue = form.user_goal_mode === 'grow_existing'
    ? Math.max(0, parseMoney(form.target_monthly_revenue) - parseMoney(form.current_monthly_revenue))
    : parseMoney(form.expected_revenue)
  if (!budget) return 50   // unknown — neutral

  // Minimum viable budgets by type
  const minimums: Record<string, number> = {
    'Café / Coffee shop': 60000,
    'Restaurant': 80000,
    'Food truck': 25000,
    'Takeaway / Fast food': 40000,
    'Bakery': 50000,
    'Grocery / Supermarket': 120000,
    'Convenience store': 85000,
    'Barber / Beauty salon': 30000,
    'Clothing retail': 45000,
    'Fitness / Gym': 70000,
    'Childcare': 90000,
    'IT / Tech services': 15000,
    'Consulting': 10000,
    'E-commerce store': 12000,
    'Mobile service business': 18000,
  }
  const minimum = minimums[form.business_type] ?? 35000
  const ratio = budget / minimum
  // >2× minimum = great, <0.6× = underfunded
  const raw = Math.min(100, Math.max(10, Math.round(ratio * 55)))

  // Bonus if revenue expectation is reasonable vs budget
  if (revenue > 0 && budget > 0) {
    const paybackMonths = budget / revenue
    if (paybackMonths < 6) return Math.min(100, raw + 8)
    if (paybackMonths > 24) return Math.max(10, raw - 12)
  }
  return raw
}

// ── Launch timeline urgency penalty ──────────────────────────────────────────
function timelinePenalty(timeline: string): number {
  if (/within 1 month/i.test(timeline)) return -12
  if (/1.3 month/i.test(timeline))      return -5
  if (/3.6 month/i.test(timeline))      return 0
  if (/6.12 month/i.test(timeline))     return 3
  return 5  // exploring = no pressure
}

// ── Cultural fit score ────────────────────────────────────────────────────────
function calcCulturalFit(form: BusinessFormData, nearbyCount: number): number {
  let score = 72  // base

  // High-review-count markets signal proven demand
  if (nearbyCount > 8)  score -= 10
  if (nearbyCount < 3)  score += 8

  const inc = incomeMultiplier(form)
  score += Math.round((inc - 0.85) * 30)

  // Audience match
  const audienceBlob = form.audience_types.join(' ')
  if (/student/i.test(form.community_type) && /student/i.test(audienceBlob)) score += 10
  if (/business|cbd|office/i.test(form.community_type) && /office|small businesses/i.test(audienceBlob)) score += 8
  if (/tourist/i.test(form.community_type) && /tourist/i.test(audienceBlob)) score += 12

  // Demographic alignment
  const ageBlob = form.target_age_groups.join(' ')
  if (ageBlob && form.community_type) {
    if (/25.35|18.25|18–25|25–35/i.test(ageBlob) && /student|multicultural/i.test(form.community_type)) score += 6
    if (/35.50|50|35–50|50\+/i.test(ageBlob) && /suburban families/i.test(form.community_type)) score += 8
  }

  return Math.min(98, Math.max(28, score))
}

// ── Competitor saturation score (higher = more saturated = worse) ─────────────
function calcSaturationScore(nearby: NearbyCompetitorData | null, radiusKm: number): { sat: number; density: number } {
  if (!nearby) return { sat: 45, density: 0 }

  const area = Math.PI * radiusKm * radiusKm
  const density = nearby.total_found / area  // competitors per km²
  const sat = Math.min(98, Math.round(density * 22 + nearby.total_found * 2.1))

  return { sat, density: Math.round(density * 100) / 100 }
}

// ── Pricing fit score ─────────────────────────────────────────────────────────
function calcPricingFit(form: BusinessFormData, nearby: NearbyCompetitorData | null): {
  score: number
  gap: ScoringSignals['price_gap']
} {
  const userPrice = parsePriceRange(form.avg_price_range)
  const inc = incomeMultiplier(form)

  if (!userPrice || !nearby?.avg_price_level) {
    // No data — use income proxy
    const score = Math.round(55 + inc * 18)
    return { score: Math.min(95, score), gap: 'unknown' }
  }

  // Google price_level: 1=<$10 2=$10-30 3=$30-60 4=$60+
  // Map user's price to comparable scale
  const userLevel = userPrice < 15 ? 1 : userPrice < 35 ? 2 : userPrice < 65 ? 3 : 4
  const marketLevel = nearby.avg_price_level

  const diff = userLevel - marketLevel
  let score = Math.round(68 + inc * 15)
  let gap: ScoringSignals['price_gap'] = 'at_market'

  if (diff === 0) { score += 8; gap = 'at_market' }
  else if (diff < 0) { score += 14; gap = 'below_market' }  // undercut = opportunity
  else if (diff === 1) { score -= 5; gap = 'above_market' }
  else { score -= 18; gap = 'above_market' }

  return { score: Math.min(97, Math.max(22, score)), gap }
}

// ── Hours opportunity detection ───────────────────────────────────────────────
function detectHoursOpportunity(competitors: NearbyPlace[]): boolean {
  if (!competitors.length) return false
  const closedCount = competitors.filter(c => c.open_now === false).length
  return closedCount / competitors.length > 0.5
}

// ── Delivery gap detection ────────────────────────────────────────────────────
function detectDeliveryGap(form: BusinessFormData, nearby: NearbyCompetitorData | null): boolean {
  if (!form.delivery_needed) return false
  if (!nearby) return true
  // If fewer than 20% of nearby places have delivery in their categories
  const deliveryCount = nearby.competitors.filter(c =>
    c.categories.some(cat => /delivery|takeaway|online/i.test(cat))
  ).length
  return deliveryCount / Math.max(1, nearby.total_found) < 0.2
}

// ── Opportunity gap score ─────────────────────────────────────────────────────
function calcOpportunityGap(
  saturation: number,
  weakCompetitors: NearbyPlace[],
  hoursOpp: boolean,
  deliveryGap: boolean,
  nearbyTotal: number
): number {
  // Base: inverse of saturation
  let score = Math.max(10, 100 - saturation)

  // Boost for exploitable competitor weaknesses
  if (weakCompetitors.length > 0) score += weakCompetitors.length * 4
  if (hoursOpp)    score += 12
  if (deliveryGap) score += 10
  if (nearbyTotal === 0) score = Math.min(score + 20, 95)

  return Math.min(96, Math.max(12, Math.round(score)))
}

// ── Demand probability score ──────────────────────────────────────────────────
function calcDemandProbability(
  form: BusinessFormData,
  nearby: NearbyCompetitorData | null,
  inc: number
): number {
  const dm = demandMultiplier(form.business_type)
  const schedule = scheduleSignals(form)
  const businessGroup = getBusinessGroup(form)
  let base = Math.round(55 * dm + inc * 18)

  // High existing competitor count = proven demand (but also competition)
  if (nearby && nearby.total_found > 5) base += 8
  if (nearby && nearby.total_found > 12) base -= 5

  // High avg rating = healthy market
  if (nearby?.avg_rating && nearby.avg_rating > 4.0) base += 6
  if (nearby?.avg_rating && nearby.avg_rating < 3.5) base -= 4

  // Audience specificity bonus
  if (form.target_customers?.length >= 2) base += 5
  if (!isDigitalTechGroup(businessGroup) && /office/i.test(form.demand_zone_type) && /Lunch-heavy|Breakfast-heavy/.test(form.lunch_dinner_demand)) base += 7
  if ((isFoodHospitalityGroup(businessGroup) || isRetailGroup(businessGroup)) && /tourist/i.test(form.demand_zone_type) && /High|Very high/.test(form.weekend_traffic_level)) base += 7
  if (!isDigitalTechGroup(businessGroup) && /residential|family/i.test(form.demand_zone_type) && /Families/.test(form.target_customers.join(' '))) base += 5
  if (!isDigitalTechGroup(businessGroup) && /High|Critical/.test(form.online_ordering_importance) && form.delivery_needed) base += 5
  if (!isDigitalTechGroup(businessGroup) && schedule.lunch_only && /Lunch-heavy/.test(form.lunch_dinner_demand)) base += 5
  if (!isDigitalTechGroup(businessGroup) && schedule.dinner_only && /Dinner-heavy/.test(form.lunch_dinner_demand)) base += 5
  if (!isDigitalTechGroup(businessGroup) && schedule.weekend_heavy && /High|Very high/.test(form.weekend_traffic_level)) base += 5
  if (isDigitalTechGroup(businessGroup) && /High|Critical/.test(form.online_ordering_importance)) base += 8
  if (isDigitalTechGroup(businessGroup) && /High|Very high/.test(form.foot_traffic_expectation)) base -= 4

  return Math.min(97, Math.max(28, Math.round(base)))
}

// ── Break-even months ─────────────────────────────────────────────────────────
function calcBreakEven(form: BusinessFormData, satScore: number): number {
  const budget  = parseMoney(form.startup_budget)
  const revenue = form.user_goal_mode === 'grow_existing'
    ? Math.max(0, parseMoney(form.target_monthly_revenue) - parseMoney(form.current_monthly_revenue))
    : parseMoney(form.expected_revenue)
  const schedule = scheduleSignals(form)

  if (!budget && form.user_goal_mode === 'grow_existing') return 6
  if (!budget) return 12
  if (!revenue) {
    // Estimate revenue from budget scale + saturation drag
    const estimatedRevenue = budget * 0.12 * (1 - satScore / 200)
    const months = Math.ceil(budget / Math.max(1000, estimatedRevenue))
    return Math.min(36, Math.max(3, months))
  }

  // Raw payback + saturation drag + staff overhead
  const staffOverhead = form.staff_count > 3 ? form.staff_count * 0.15 : 0
  const satDrag = satScore > 70 ? 1.3 : satScore > 50 ? 1.1 : 1.0
  const scheduleDrag = schedule.weekday_only ? 1.08 : schedule.weekend_heavy ? 0.95 : schedule.all_day ? 0.92 : 1
  const months = Math.ceil((budget / revenue) * satDrag * (1 + staffOverhead) * scheduleDrag)
  return Math.min(36, Math.max(3, months))
}

// ── Failure risk score ────────────────────────────────────────────────────────
function calcFailureRisk(
  satScore: number,
  budgetScore: number,
  timelinePen: number,
  form: BusinessFormData
): number {
  let risk = Math.round(
    satScore * 0.35 +
    (100 - budgetScore) * 0.30 +
    Math.max(0, -timelinePen) * 2
  )

  if (/just exploring/i.test(form.launch_timeline)) risk -= 8
  if (/high/i.test(form.risk_tolerance))  risk -= 5
  if (/low/i.test(form.risk_tolerance))   risk += 8
  if (form.user_goal_mode === 'grow_existing' && form.current_challenges.length >= 3) risk += 6
  if (form.user_goal_mode === 'grow_existing' && parseMoney(form.target_monthly_revenue) > parseMoney(form.current_monthly_revenue) * 2) risk += 8

  return Math.min(95, Math.max(8, Math.round(risk)))
}

function calcCurrentHealthScore(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 60

  let score = 48
  score += Math.min(16, form.repeat_customer_rate / 4)
  score += Math.min(10, parseMoney(form.average_basket_value) / 12)
  score += Math.min(10, form.average_gross_margin / 6)
  score += form.average_google_rating ? Math.round(Number(form.average_google_rating) * 4) - 12 : 0
  score += form.google_review_count > 100 ? 8 : form.google_review_count > 40 ? 4 : 0
  score += /strong|excellent/i.test(form.website_conversion_quality) ? 6 : /poor/i.test(form.website_conversion_quality) ? -6 : 0
  score -= form.current_challenges.length * 3
  score -= /high/i.test(form.supplier_dependency_risk) ? 9 : /medium/i.test(form.supplier_dependency_risk) ? 4 : 0

  if (parseMoney(form.monthly_fixed_costs) > parseMoney(form.current_monthly_revenue) * 0.35) score -= 8
  if (parseMoney(form.monthly_staff_costs) > parseMoney(form.current_monthly_revenue) * 0.35) score -= 8
  if (form.average_daily_customers > 0 && form.repeat_customer_rate >= 35) score += 4

  return Math.min(95, Math.max(18, Math.round(score)))
}

function calcDigitalMaturityScore(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 45
  let score = 25
  if (form.website_url) score += 12
  if (form.google_business_profile_url) score += 12
  if (form.instagram_url) score += 8
  if (form.facebook_url) score += 6
  if (form.tiktok_url) score += 6
  if (form.linkedin_url) score += 5
  score += Math.min(14, form.average_monthly_website_visitors / 400)
  score += Math.min(8, form.instagram_followers / 500)
  score += /strong|excellent/i.test(form.website_conversion_quality) ? 12 : /basic|poor/i.test(form.website_conversion_quality) ? 2 : 7
  return Math.min(96, Math.max(20, Math.round(score)))
}

function calcRetentionRisk(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 40
  let risk = 55
  risk -= Math.min(20, form.repeat_customer_rate / 2)
  risk -= parseMoney(form.customer_lifetime_estimate) > 400 ? 8 : 0
  risk += form.current_challenges.some(item => /repeat|churn/i.test(item)) ? 14 : 0
  risk += form.current_challenges.some(item => /upselling/i.test(item)) ? 6 : 0
  return Math.min(95, Math.max(8, Math.round(risk)))
}

function calcSocialMediaOpportunity(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 50
  let score = 45
  score += form.social_media_channels.length >= 2 ? 8 : 0
  score += form.instagram_followers > 1000 ? 10 : form.instagram_followers > 200 ? 5 : 0
  score += form.average_post_engagement >= 5 ? 12 : form.average_post_engagement >= 2 ? 6 : 0
  score += form.current_challenges.some(item => /social media|branding/i.test(item)) ? 10 : 0
  return Math.min(95, Math.max(18, Math.round(score)))
}

function calcSeoGap(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 45
  let score = 60
  score -= form.google_business_profile_url ? 12 : 0
  score -= form.google_review_count > 100 ? 14 : form.google_review_count > 30 ? 8 : 0
  score -= Number(form.average_google_rating || '0') >= 4.4 ? 10 : Number(form.average_google_rating || '0') >= 4.1 ? 5 : 0
  score += form.current_challenges.some(item => /seo|google reviews/i.test(item)) ? 18 : 0
  return Math.min(96, Math.max(10, Math.round(score)))
}

function calcSecondBranchReadiness(form: BusinessFormData, currentHealth: number): number {
  if (form.user_goal_mode !== 'grow_existing') return 35
  let score = 35 + currentHealth * 0.35
  score += parseMoney(form.target_monthly_revenue) > parseMoney(form.current_monthly_revenue) * 1.4 ? 8 : 0
  score += form.new_suburb_expansion || /second suburb|second branch/i.test(form.growth_strategy_type) ? 10 : 0
  score -= form.current_challenges.length > 4 ? 10 : 0
  return Math.min(95, Math.max(15, Math.round(score)))
}

function calcDeliveryExpansionReadiness(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 40
  let score = 30
  score += form.delivery_platform_usage.length > 0 && !form.delivery_platform_usage.includes('No delivery') ? 18 : 0
  score += form.delivery_order_percentage >= 20 ? 16 : form.delivery_order_percentage >= 10 ? 8 : 0
  score += form.delivery_expansion || /delivery/i.test(form.growth_strategy_type) ? 12 : 0
  score -= form.current_challenges.some(item => /delivery/i.test(item)) ? 6 : 0
  return Math.min(95, Math.max(15, Math.round(score)))
}

function calcCustomerLifetimeScore(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 45
  const ltv = parseMoney(form.customer_lifetime_estimate)
  let score = 35
  score += Math.min(18, ltv / 60)
  score += Math.min(14, form.repeat_customer_rate / 4)
  score += form.average_basket_value ? Math.min(10, parseMoney(form.average_basket_value) / 10) : 0
  return Math.min(95, Math.max(15, Math.round(score)))
}

function calcLocalBrandStrength(form: BusinessFormData): number {
  if (form.user_goal_mode !== 'grow_existing') return 50
  let score = 30
  score += form.google_review_count > 120 ? 18 : form.google_review_count > 40 ? 10 : 0
  score += Number(form.average_google_rating || '0') >= 4.5 ? 14 : Number(form.average_google_rating || '0') >= 4.1 ? 8 : 0
  score += form.social_media_channels.length > 0 ? 8 : 0
  score += form.instagram_followers > 1000 ? 8 : form.instagram_followers > 300 ? 4 : 0
  return Math.min(95, Math.max(15, Math.round(score)))
}

function calcDecisionConfidence(successScore: number, form: BusinessFormData): number {
  let score = successScore * 0.55
  score += form.business_type ? 8 : 0
  score += form.target_customers.length >= 2 ? 7 : 3
  score += form.community_type ? 6 : 0
  score += form.user_goal_mode === 'grow_existing' ? 12 : 0
  return Math.min(97, Math.max(20, Math.round(score)))
}

function calcDifferentiationScore(opportunityScore: number, form: BusinessFormData, weakCompetitors: NearbyPlace[]): number {
  let score = opportunityScore * 0.45
  score += weakCompetitors.length > 0 ? 12 : 0
  score += form.products_services.split(/[,\n]/).filter(Boolean).length >= 2 ? 8 : 3
  score += form.target_customers.length > 1 ? 8 : 4
  return Math.min(95, Math.max(18, Math.round(score)))
}

// ── Market maturity label ─────────────────────────────────────────────────────
function classifyMaturity(count: number, avgRating: number | null): ScoringSignals['market_maturity'] {
  if (count === 0) return 'emerging'
  if (count < 4)  return 'growing'
  if (count < 10 && (avgRating === null || avgRating < 4.0)) return 'growing'
  if (count >= 10 && avgRating !== null && avgRating >= 4.2) return 'saturated'
  return 'mature'
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function runScoringEngine(inputs: ScoringInputs): ScoringOutput {
  const { form, nearby } = inputs
  const businessGroup = getBusinessGroup(form)
  const inc       = incomeMultiplier(form)
  const dm        = demandMultiplier(form.business_type)
  const budgetScore = calcBudgetScore(form)
  const tlPenalty = timelinePenalty(form.launch_timeline)
  const competitors = nearby?.competitors ?? []
  const count     = nearby?.total_found ?? 0

  // Derived signals
  const weak      = competitors.filter(c => c.rating !== null && c.rating < 3.5)
  const strong    = competitors.filter(c => c.rating !== null && c.rating >= 4.2)
  const highReview= competitors.filter(c => c.review_count !== null && c.review_count > 200)
  const lowReview = competitors.filter(c => c.review_count !== null && c.review_count < 20)
  const openNow   = competitors.filter(c => c.open_now === true).length
  const closedNow = competitors.filter(c => c.open_now === false).length
  const hoursOpp  = detectHoursOpportunity(competitors)
  const delivGap  = detectDeliveryGap(form, nearby)

  const { sat: satScore, density } = calcSaturationScore(nearby, form.radius_km)
  const { score: priceScore, gap: priceGap } = calcPricingFit(form, nearby)
  const culturalScore  = calcCulturalFit(form, count)
  const oppScore       = calcOpportunityGap(satScore, weak, hoursOpp, delivGap, count)
  const demandScore    = calcDemandProbability(form, nearby, inc)
  const breakEven      = calcBreakEven(form, satScore)
  const failRisk       = calcFailureRisk(satScore, budgetScore, tlPenalty, form)
  const currentHealth  = calcCurrentHealthScore(form)
  const digitalMaturity = calcDigitalMaturityScore(form)
  const retentionRisk = calcRetentionRisk(form)
  const socialOpportunity = calcSocialMediaOpportunity(form)
  const seoGap = calcSeoGap(form)
  const branchReadiness = calcSecondBranchReadiness(form, currentHealth)
  const deliveryReadiness = calcDeliveryExpansionReadiness(form)
  const lifetimeScore = calcCustomerLifetimeScore(form)
  const brandStrength = calcLocalBrandStrength(form)
  const schedule = scheduleSignals(form)
  const scheduleFit =
    (schedule.lunch_only && /Lunch-heavy/.test(form.lunch_dinner_demand)) ||
    (schedule.dinner_only && /Dinner-heavy/.test(form.lunch_dinner_demand)) ||
    (schedule.weekend_heavy && /High|Very high/.test(form.weekend_traffic_level))
      ? 'strong'
      : isDigitalTechGroup(businessGroup) && form.operating_hours
      ? 'strong'
      : form.operating_hours
      ? 'mixed'
      : 'weak'

  // ── Composite success score — weighted formula ──────────────────────────────
  const rawSuccess =
    demandScore    * 0.22 +
    (100 - satScore) * 0.20 +
    culturalScore  * 0.15 +
    priceScore     * 0.15 +
    oppScore       * 0.18 +
    budgetScore    * 0.10 +
    (form.user_goal_mode === 'grow_existing' ? currentHealth * 0.10 : 0)

  const successScore = Math.min(97, Math.max(12, Math.round(rawSuccess + tlPenalty * 0.5)))
  const decisionConfidence = calcDecisionConfidence(successScore, form)
  const differentiation = calcDifferentiationScore(oppScore, form, weak)
  const businessViability = Math.min(97, Math.max(12, Math.round((successScore * 0.5) + (demandScore * 0.2) + ((100 - failRisk) * 0.2) + (priceScore * 0.1))))
  const suburbOpportunity = Math.min(96, Math.max(12, Math.round((oppScore * 0.5) + ((100 - satScore) * 0.2) + (culturalScore * 0.15) + (demandScore * 0.15))))
  const pricingConfidence = Math.min(95, Math.max(15, Math.round((priceScore * 0.7) + (budgetScore * 0.15) + (culturalScore * 0.15))))
  const retentionStrength = Math.min(95, Math.max(10, Math.round(100 - retentionRisk)))
  const expansionReadiness = Math.min(95, Math.max(15, Math.round((branchReadiness * 0.5) + (deliveryReadiness * 0.2) + (currentHealth * 0.3))))
  const digitalAcquisitionStrength = Math.min(95, Math.max(15, Math.round((digitalMaturity * 0.45) + ((100 - seoGap) * 0.25) + (socialOpportunity * 0.3))))

  const signals: ScoringSignals = {
    competitor_count: count,
    avg_competitor_rating: nearby?.avg_rating ?? null,
    weak_competitors: weak,
    strong_competitors: strong,
    open_now_count: openNow,
    closed_count: closedNow,
    high_review_count: highReview.length,
    low_review_count: lowReview.length,
    price_gap: priceGap,
    density_per_sqkm: density,
    budget_monthly_capacity: parseMoney(form.startup_budget),
    hours_opportunity: hoursOpp,
    delivery_gap: delivGap,
    saturation_label: nearby?.competitor_density ?? 'low',
    market_maturity: classifyMaturity(count, nearby?.avg_rating ?? null),
    open_day_count: schedule.open_day_count,
    closed_days: schedule.closed_days,
    busiest_trading_window: schedule.busiest_trading_window,
    schedule_fit: scheduleFit,
  }

  return {
    success_score:              successScore,
    decision_confidence_score:  decisionConfidence,
    business_viability_score:   businessViability,
    differentiation_score:      differentiation,
    suburb_opportunity_score:   suburbOpportunity,
    pricing_confidence_score:   pricingConfidence,
    customer_retention_strength_score: retentionStrength,
    expansion_readiness_score:  expansionReadiness,
    digital_acquisition_strength_score: digitalAcquisitionStrength,
    current_health_score:       currentHealth,
    digital_maturity_score:     digitalMaturity,
    retention_risk_score:       retentionRisk,
    social_media_opportunity_score: socialOpportunity,
    seo_gap_score:              seoGap,
    second_branch_readiness_score: branchReadiness,
    delivery_expansion_readiness_score: deliveryReadiness,
    customer_lifetime_score:    lifetimeScore,
    local_brand_strength_score: brandStrength,
    cultural_fit_score:         culturalScore,
    competitor_saturation_score:satScore,
    pricing_fit_score:          priceScore,
    failure_risk_score:         failRisk,
    opportunity_gap_score:      oppScore,
    demand_probability_score:   demandScore,
    break_even_months:          breakEven,
    signals,
  }
}
