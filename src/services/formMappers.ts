// ─────────────────────────────────────────────────────────────────────────────
// Form mappers — convert form shapes into the canonical scoring-engine input.
// ─────────────────────────────────────────────────────────────────────────────

import type { BusinessFormData, ExistingBusinessFormData } from '@/types'

export function mapExistingFormToScoringForm(
  form: ExistingBusinessFormData,
  lat: number | null,
  lng: number | null,
): BusinessFormData {
  const revenueNum = parseInt(form.current_revenue?.replace(/\D/g, '') || '0', 10)
  const budgetNum = parseInt(form.change_budget?.replace(/\D/g, '') || '0', 10)

  const modelType =
    form.location_type === 'online' ? 'online' :
    form.location_type === 'both' ? 'hybrid' :
    'physical'

  return {
    user_goal_mode: 'grow_existing',
    business_name: form.business_name,
    business_concept: form.description,
    business_model_type: modelType,
    state: form.state,
    suburb: form.suburb,
    postcode: form.postcode,
    city: form.city,
    lat,
    lng,
    suburb_profile: null,
    radius_km: form.radius_km ?? 10,
    business_type: form.business_type,
    business_type_other: '',
    products_services: form.description,
    avg_price_range: '',
    startup_budget: String(budgetNum),
    staff_count: form.staff_count,
    operating_hours: '',
    operating_schedule: [],
    target_customers: [],
    target_market: '',
    ad_budget_monthly: '',
    delivery_coverage: '',
    delivery_coverage_custom: '',
    demand_zone_type: '',
    delivery_zone_importance: '',
    anchor_locations: [],
    community_type: '',
    income_level: '',
    target_age_groups: [],
    audience_types: [],
    delivery_needed: false,
    lunch_dinner_demand: '',
    weekend_traffic_level: '',
    online_ordering_importance: '',
    foot_traffic_expectation: '',
    expected_revenue: String(revenueNum),
    launch_timeline: form.timeline,
    growth_goal: form.owner_goal,
    supply_model: '',
    launch_inventory_assumption: '',
    break_even_expectation: '',
    strategic_goals: [],
    risk_tolerance: 'medium',
    current_monthly_revenue: String(revenueNum),
    target_monthly_revenue: '',
    current_challenges: form.problems,
    current_customer_type: '',
    existing_online_presence: form.website_url || form.social_handles ? 'Basic' : 'None',
    expansion_goal: form.owner_goal,
    growth_strategy_type:
      form.owner_goal.includes('Expand') ? 'Open a second location' :
      form.owner_goal.includes('Pivot') ? 'Pivot to a new product or service' :
      'Improve current site performance',
    new_suburb_expansion: form.owner_goal.includes('second location'),
    delivery_expansion: false,
    business_age_band: form.years_operating,
    years_in_business:
      form.years_operating.includes('5+') ? 6 :
      form.years_operating.includes('3–5') ? 4 :
      form.years_operating.includes('1–3') ? 2 : 0,
    current_location_suburb: form.suburb,
    premises_type: 'leased',
    current_team_size: form.staff_count,
    average_daily_customers: 0,
    repeat_customer_rate: 30,
    average_basket_value: '',
    best_selling_offer_price: '',
    premium_upsell_price: '',
    monthly_fixed_costs: '',
    monthly_staff_costs: '',
    average_gross_margin: 40,
    best_selling_products: [],
    worst_performing_products: [],
    busiest_trading_days: [],
    quietest_trading_days: [],
    best_traffic_channels: [],
    best_converting_offers: [],
    lead_sources: [],
    peak_enquiry_periods: [],
    strongest_acquisition_channels: [],
    average_google_rating: '',
    google_review_count: 0,
    social_media_channels: form.social_handles ? ['Instagram'] : [],
    website_conversion_quality: form.website_url ? 'Basic' : 'None',
    delivery_platform_usage: [],
    supplier_dependency_risk: 'medium',
    website_url: form.website_url,
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    google_business_profile_url: form.google_maps_url,
    linkedin_url: '',
    average_monthly_website_visitors: 0,
    instagram_followers: 0,
    average_post_engagement: 0,
    average_weekly_enquiries: 0,
    conversion_rate: 0,
    delivery_order_percentage: 0,
    walk_in_percentage: 80,
    customer_lifetime_estimate: '',
    competitor_url_1: '',
    competitor_url_2: '',
    competitor_url_3: '',
  }
}
