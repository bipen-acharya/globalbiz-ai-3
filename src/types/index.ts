export type BusinessModelType = 'physical' | 'online' | 'hybrid'
export type UserGoalMode = 'start_new' | 'grow_existing'
export type InsightSourceLabel = 'real_data' | 'estimated' | 'rules_based'

export interface AnalysisSectionSource {
  nearby_competitors: InsightSourceLabel
  market_gaps: InsightSourceLabel
  recommendations: InsightSourceLabel
  setup_checklist: InsightSourceLabel
  growth_opportunities: InsightSourceLabel
}

export interface SetupChecklistSection {
  title: string
  items: string[]
}

export interface AustraliaSuburb {
  suburb: string
  postcode: string
  city: string
  state: string
  metro_zone: string
  council: string
  lat: number
  lng: number
  population_band: 'low' | 'medium' | 'high'
  business_density_band: 'low' | 'medium' | 'high'
}

export interface OperatingDay {
  day: string
  open: string | null
  close: string | null
  closed: boolean
}

export interface BusinessFormData {
  user_goal_mode: UserGoalMode
  business_name: string
  business_concept: string
  business_model_type: BusinessModelType
  state: string
  suburb: string
  postcode: string
  city: string
  lat: number | null
  lng: number | null
  suburb_profile: AustraliaSuburb | null
  radius_km: number
  business_type: string
  business_type_other: string
  products_services: string
  avg_price_range: string
  startup_budget: string
  staff_count: number
  operating_hours: string
  operating_schedule: OperatingDay[]
  target_customers: string[]
  target_market: string
  ad_budget_monthly: string
  delivery_coverage: string
  delivery_coverage_custom: string
  demand_zone_type: string
  delivery_zone_importance: string
  anchor_locations: string[]
  community_type: string
  income_level: string
  target_age_groups: string[]
  audience_types: string[]
  delivery_needed: boolean
  lunch_dinner_demand: string
  weekend_traffic_level: string
  online_ordering_importance: string
  foot_traffic_expectation: string
  expected_revenue: string
  launch_timeline: string
  growth_goal: string
  supply_model: string
  launch_inventory_assumption: string
  break_even_expectation: string
  strategic_goals: string[]
  risk_tolerance: string
  current_monthly_revenue: string
  target_monthly_revenue: string
  current_challenges: string[]
  current_customer_type: string
  existing_online_presence: string
  expansion_goal: string
  growth_strategy_type: string
  new_suburb_expansion: boolean
  delivery_expansion: boolean
  business_age_band: string
  years_in_business: number
  current_location_suburb: string
  premises_type: 'leased' | 'owned' | ''
  current_team_size: number
  average_daily_customers: number
  repeat_customer_rate: number
  average_basket_value: string
  best_selling_offer_price: string
  premium_upsell_price: string
  monthly_fixed_costs: string
  monthly_staff_costs: string
  average_gross_margin: number
  best_selling_products: string[]
  worst_performing_products: string[]
  busiest_trading_days: string[]
  quietest_trading_days: string[]
  best_traffic_channels: string[]
  best_converting_offers: string[]
  lead_sources: string[]
  peak_enquiry_periods: string[]
  strongest_acquisition_channels: string[]
  average_google_rating: string
  google_review_count: number
  social_media_channels: string[]
  website_conversion_quality: string
  delivery_platform_usage: string[]
  supplier_dependency_risk: string
  website_url: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  google_business_profile_url: string
  linkedin_url: string
  average_monthly_website_visitors: number
  instagram_followers: number
  average_post_engagement: number
  average_weekly_enquiries: number
  conversion_rate: number
  delivery_order_percentage: number
  walk_in_percentage: number
  customer_lifetime_estimate: string
}

export interface NearbyPlace {
  place_id: string
  name: string
  address: string
  match_type: 'direct' | 'indirect'
  direct_or_indirect?: 'direct' | 'indirect'
  competitor_strength?: 'strong' | 'moderate' | 'weak'
  rating: number | null
  review_count: number | null
  price_level: number | null
  categories: string[]
  lat: number
  lng: number
  open_now: boolean | null
  distance_km: number | null
}

export interface NearbyCompetitorData {
  source: 'google' | 'osm'
  total_found: number
  competitors: NearbyPlace[]
  avg_rating: number | null
  avg_price_level: number | null
  competitor_density: 'low' | 'medium' | 'high' | 'saturated'
  search_radius_km: number
  strong_count?: number
  moderate_count?: number
  weak_count?: number
  shopping_center_anchors?: string[]
  food_hotspots?: string[]
  local_retail_clusters?: string[]
}

export interface CompetitorThreat {
  name: string
  address: string
  rating: number | null
  review_count: number | null
  price_level: number | null
  categories: string[]
  threat_level: 'strong' | 'established' | 'opportunity' | 'differentiation'
  why_threat: string
  how_to_beat: string
}

export interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'location' | 'pricing' | 'marketing' | 'product' | 'digital' | 'community'
}

export interface RoadmapWeek {
  period: string
  title: string
  tasks: string[]
}

export interface AlternativeLocation {
  name: string
  suburb?: string
  postcode?: string
  score: number
  reason: string
}

export interface AnalysisResult {
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
  executive_summary: string
  summary: string
  why_succeed: string[]
  why_fail: string[]
  missing_elements: string[]
  key_bottlenecks: string[]
  opportunity_highlights: string[]
  fastest_growth_levers: string[]
  competitor_threats: CompetitorThreat[]
  why_competitors_succeed: string[]
  best_differentiation: string[]
  best_underserved_niche: string
  suggested_better_suburb: AlternativeLocation | null
  recommendations: Recommendation[]
  growth_opportunities: string[]
  recommended_actions: string[]
  setup_checklist: SetupChecklistSection[]
  setup_checklist_summary: string
  what_to_fix_first: string[]
  how_to_improve_current_business: string[]
  expansion_options: string[]
  revenue_leakage_points: string[]
  operational_bottlenecks: string[]
  pricing_uplift_opportunities: string[]
  local_seo_google_review_weakness: string[]
  delivery_radius_expansion_suggestion: string[]
  customer_retention_fixes: string[]
  repeat_customer_playbook: string[]
  cost_reduction_opportunities: string[]
  staff_utilisation_issues: string[]
  supplier_dependency_risks: string[]
  top_90_day_actions: string[]
  action_plan_30_day: string[]
  important_assumptions: string[]
  section_sources: AnalysisSectionSource
  roadmap: RoadmapWeek[]
  alternative_locations: AlternativeLocation[]
  nearby_data: NearbyCompetitorData | null
}

export interface ExistingBusinessFormData {
  business_name: string
  business_type: string
  website_url: string
  google_maps_url: string
  address: string
  state: string
  suburb: string
  postcode: string
  city: string
  lat: number | null
  lng: number | null
  years_operating: string
  current_revenue: string
  staff_count: number
  description: string
  social_handles: string
  problems: string[]
  situation_description: string
  what_tried: string
  owner_goal: string
  change_budget: string
  timeline: string
}

export interface Report {
  id: string
  created_at: string
  report_type?: 'new' | 'existing'
  user_goal_mode: UserGoalMode
  business_name?: string | null
  state: string
  city: string
  suburb: string
  postcode: string
  business_type: string
  business_type_other?: string | null
  business_model_type: BusinessModelType
  products_services?: string | null
  avg_price_range?: string | null
  operating_hours?: string | null
  radius_km?: number | null
  lat?: number | null
  lng?: number | null
  competitors?: NearbyPlace[]
  competitor_stats?: {
    total: number
    strong: number
    moderate: number
    weak: number
    avg_rating: number | null
    density: NearbyCompetitorData['competitor_density']
  }
  analysis: AnalysisResult
}

export interface DailyUsage {
  usage_date: string
  count: number
  limit_val: number
}

export interface AnalyzeSuccessResponse {
  success: true
  reportId: string
  report: AnalysisResult
  _temp?: boolean
}

export interface AnalyzeErrorResponse {
  success: false
  error: string
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse
