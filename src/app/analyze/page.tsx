'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, MapPin, Search, Sparkles, Store, X, Building2, MapPinned } from 'lucide-react'
import type { AnalyzeResponse, AustraliaSuburb, BusinessFormData, BusinessModelType, UserGoalMode } from '@/types'
import {
  AU_STATES,
  LOCATION_INTENT_SUGGESTIONS,
  findSuburbByFlexibleQuery,
  getCommunityHint,
  getDemandHint,
  getLocationIntentResults,
  getPopularSuburbSuggestions,
  searchSuburbs,
  suburbDisplayLabel,
} from '@/lib/australia-suburbs'
import {
  BUSINESS_TYPES,
  BUSINESS_AGE_OPTIONS,
  AGE_GROUP_OPTIONS,
  ANCHOR_LOCATION_OPTIONS,
  AUDIENCE_TYPE_OPTIONS,
  COMMUNITY_TYPES,
  CONVERTING_OFFER_OPTIONS,
  CURRENT_CUSTOMER_TYPE_OPTIONS,
  DEMAND_ZONE_OPTIONS,
  DELIVERY_COVERAGE_OPTIONS,
  DELIVERY_ZONE_IMPORTANCE_OPTIONS,
  DELIVERY_PLATFORM_OPTIONS,
  DIGITAL_CHALLENGE_OPTIONS,
  EXPANSION_GOAL_OPTIONS,
  BREAK_EVEN_EXPECTATION_OPTIONS,
  FOOT_TRAFFIC_OPTIONS,
  GROWTH_STRATEGY_OPTIONS,
  getDynamicProductServiceOptions,
  isDigitalOperationsBusiness,
  IMPORTANCE_OPTIONS,
  INVENTORY_ASSUMPTION_OPTIONS,
  LAUNCH_TIMELINE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LUNCH_DINNER_DEMAND_OPTIONS,
  ONLINE_PRESENCE_OPTIONS,
  PEAK_ENQUIRY_PERIOD_OPTIONS,
  PRICE_RANGE_OPTIONS,
  PREMISES_TYPE_OPTIONS,
  SOCIAL_MEDIA_CHANNEL_OPTIONS,
  STRATEGIC_GOAL_OPTIONS,
  SUPPLY_MODEL_OPTIONS,
  SUPPLIER_RISK_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  TARGET_MARKET_OPTIONS,
  TRAFFIC_CHANNEL_OPTIONS,
  TRADING_DAY_OPTIONS,
  USER_GOAL_OPTIONS,
  WEEKEND_TRAFFIC_OPTIONS,
  WEBSITE_CONVERSION_OPTIONS,
  ACQUISITION_CHANNEL_OPTIONS,
} from '@/lib/australia-business-rules'
import { StepNavigation, StepProgress } from '@/components/analyze/StepNavigation'
import { BusinessModelStep } from '@/components/analyze/BusinessModelStep'
import { ReportSummary } from '@/components/analyze/ReportSummary'
import { RiskSelector } from '@/components/analyze/RiskSelector'
import { useNotifications } from '@/components/ui/notifications'
import {
  getBusinessGroup,
  getBusinessGroupLabel,
  isDigitalTechGroup,
  isFoodHospitalityGroup,
  isLocalServicesGroup,
  isRetailGroup,
  type BusinessGroup,
} from '@/lib/business-groups'

const STORAGE_KEY = 'globalbiz_form_draft_v3'
const TEMP_REPORT_KEY = 'globalbiz_temp_report'
const RECENT_SEARCHES_KEY = 'globalbiz_recent_suburbs_v1'
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const TIME_OPTIONS = [
  '12:00 am','12:30 am','1:00 am','1:30 am','2:00 am','2:30 am','3:00 am','3:30 am','4:00 am','4:30 am','5:00 am','5:30 am','6:00 am','6:30 am','7:00 am','7:30 am','8:00 am','8:30 am','9:00 am','9:30 am',
  '10:00 am','10:30 am','11:00 am','11:30 am','12:00 pm','12:30 pm','1:00 pm','1:30 pm','2:00 pm','2:30 pm',
  '3:00 pm','3:30 pm','4:00 pm','4:30 pm','5:00 pm','5:30 pm','6:00 pm','6:30 pm','7:00 pm','7:30 pm',
  '8:00 pm','8:30 pm','9:00 pm','9:30 pm','10:00 pm','10:30 pm','11:00 pm','11:30 pm'
] as const

const LOADING_STAGES = [
  { label: 'Checking the Australian market...', sub: 'Combining suburb signals, competitor data, and feasibility logic.' },
  { label: 'Reviewing competitors and gaps...', sub: 'Separating real local data from estimated insights.' },
  { label: 'Scoring launch or growth potential...', sub: 'Comparing budget, pricing, timing, and expansion upside.' },
  { label: 'Building your action plan...', sub: 'Adding Australian setup, permits, and next-step guidance.' },
]

const DEFAULT_FORM: BusinessFormData = {
  user_goal_mode: 'start_new',
  business_name: '',
  business_concept: '',
  business_model_type: 'physical',
  state: '',
  suburb: '',
  postcode: '',
  city: '',
  lat: null,
  lng: null,
  suburb_profile: null,
  radius_km: 3,
  business_type: '',
  business_type_other: '',
  products_services: '',
  avg_price_range: '',
  startup_budget: '',
  staff_count: 1,
  operating_hours: '',
  operating_schedule: DAYS_OF_WEEK.map(day => ({ day, open: '9:00 am', close: '5:00 pm', closed: day === 'Sunday' })),
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
  expected_revenue: '',
  launch_timeline: '',
  growth_goal: '',
  supply_model: '',
  launch_inventory_assumption: '',
  break_even_expectation: '',
  strategic_goals: [],
  risk_tolerance: 'medium',
  current_monthly_revenue: '',
  target_monthly_revenue: '',
  current_challenges: [],
  current_customer_type: '',
  existing_online_presence: '',
  expansion_goal: '',
  growth_strategy_type: '',
  new_suburb_expansion: false,
  delivery_expansion: false,
  business_age_band: '',
  years_in_business: 1,
  current_location_suburb: '',
  premises_type: '',
  current_team_size: 2,
  average_daily_customers: 20,
  repeat_customer_rate: 25,
  average_basket_value: '',
  best_selling_offer_price: '',
  premium_upsell_price: '',
  monthly_fixed_costs: '',
  monthly_staff_costs: '',
  average_gross_margin: 45,
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
  social_media_channels: [],
  website_conversion_quality: '',
  delivery_platform_usage: [],
  supplier_dependency_risk: '',
  website_url: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  google_business_profile_url: '',
  linkedin_url: '',
  average_monthly_website_visitors: 0,
  instagram_followers: 0,
  average_post_engagement: 0,
  average_weekly_enquiries: 0,
  conversion_rate: 0,
  delivery_order_percentage: 0,
  walk_in_percentage: 0,
  customer_lifetime_estimate: '',
}

type FormErrors = Partial<Record<keyof BusinessFormData | 'suburb_search', string>>

const RADIUS_OPTIONS = [1, 3, 5, 10]
const INCOME_LEVEL_OPTIONS = ['Low income', 'Lower-middle income', 'Middle income', 'Upper-middle income', 'High income', 'Mixed'] as const
const GROW_EXISTING_STEP_FIELD_ORDER = [
  ['user_goal_mode', 'business_model_type'],
  ['business_name', 'business_type', 'products_services', 'avg_price_range', 'state', 'suburb_search', 'radius_km', 'business_age_band', 'premises_type'],
  ['website_url', 'google_business_profile_url', 'average_google_rating'],
  ['current_monthly_revenue', 'current_challenges'],
  ['strategic_goals', 'expansion_goal', 'growth_strategy_type'],
  ['suburb_search', 'radius_km'],
] as const

function getStartNewStepFieldOrder(group: BusinessGroup, form: BusinessFormData) {
  const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
  const isOnline = form.business_model_type === 'online' || form.business_model_type === 'hybrid'

  return [
    ['user_goal_mode', 'business_model_type', 'business_type', 'business_type_other', 'business_concept'],
    [
      'state',
      ...(isPhysical ? ['suburb_search', 'radius_km'] : []),
      ...(isOnline ? ['target_market', 'delivery_coverage', 'delivery_coverage_custom'] : []),
      ...(isDigitalTechGroup(group) ? [] : ['demand_zone_type']),
      ...(isDigitalTechGroup(group) ? [] : ['delivery_zone_importance']),
      ...(isDigitalTechGroup(group) ? [] : ['anchor_locations']),
    ],
    [
      'audience_types',
      'target_age_groups',
      'income_level',
      'community_type',
      ...(isFoodHospitalityGroup(group) ? ['lunch_dinner_demand', 'weekend_traffic_level', 'online_ordering_importance', 'foot_traffic_expectation'] : []),
      ...(isRetailGroup(group) ? ['weekend_traffic_level', 'foot_traffic_expectation'] : []),
      ...(isLocalServicesGroup(group) ? ['online_ordering_importance'] : []),
      ...(isDigitalTechGroup(group) ? ['online_ordering_importance', 'foot_traffic_expectation'] : []),
    ],
    [
      'products_services',
      'avg_price_range',
      'staff_count',
      ...(isPhysical ? ['operating_hours'] : []),
      'supply_model',
      'target_customers',
      'launch_inventory_assumption',
    ],
    ['startup_budget', 'expected_revenue', 'launch_timeline', 'risk_tolerance', 'growth_goal', 'break_even_expectation'],
    [...(isPhysical ? ['suburb_search', 'radius_km'] : ['target_market', 'delivery_coverage'])],
  ] as const
}

const FIELD_GUIDANCE: Record<string, string> = {
  user_goal_mode: 'Choose the goal first so we can tailor the rest of the workflow.',
  business_model_type: 'Choose the operating model so we can use the right location and competitor logic.',
  business_name: 'Add the business name so the report reads like a real founder brief.',
  business_concept: 'Add a one-line concept so we can test whether the idea fits the suburb and customer demand.',
  business_type: 'Choose the closest business category so benchmarking stays relevant.',
  business_type_other: 'Add the business category so we can benchmark the right competitors.',
  products_services: 'Describe the offer so we can compare it to local competitors and customer demand.',
  avg_price_range: 'Add your average pricing so we can benchmark local competitors accurately.',
  state: 'Choose the Australian state first so suburb and competitor analysis stays accurate.',
  suburb_search: 'Select a suburb from the lookup so we can anchor the competitor scan to a real trading area.',
  radius_km: 'Choose a competitor radius so nearby market pressure is measured properly.',
  business_age_band: 'Choose the operating age so the report can judge maturity and expectations fairly.',
  premises_type: 'Tell us whether the premises are leased or owned so fixed-cost advice stays realistic.',
  target_market: 'Choose the Australian market you want to serve so digital demand is anchored properly.',
  delivery_coverage: 'Choose the real service coverage so we can compare reachable demand and competition.',
  delivery_coverage_custom: 'Describe the custom service area so the delivery and expansion advice is realistic.',
  demand_zone_type: 'Choose the main demand zone so the report can interpret the suburb like a real catchment.',
  delivery_zone_importance: 'Tell us how important delivery reach is so we can weigh digital convenience correctly.',
  anchor_locations: 'Pick the nearby anchors so we can assess whether the suburb has the right demand magnets.',
  target_customers: 'Pick the audience groups you want to serve so the demand analysis is more useful.',
  lunch_dinner_demand: 'Choose when demand matters most so the schedule and demand fit can be scored properly.',
  weekend_traffic_level: 'Choose weekend traffic expectations so the report can assess trade timing and staffing pressure.',
  online_ordering_importance: 'Tell us how important online ordering is so digital convenience is weighted correctly.',
  foot_traffic_expectation: 'Choose the expected foot traffic so the launch assumptions match the suburb reality.',
  supply_model: 'Choose the supply model so setup risk and margin pressure can be estimated realistically.',
  launch_inventory_assumption: 'Choose the launch inventory assumption so setup cost and cashflow advice stay realistic.',
  startup_budget: 'Add a realistic budget so we can test feasibility before you invest.',
  ad_budget_monthly: 'Add your monthly ad budget if digital acquisition matters for this business.',
  website_url: 'Add the website URL so we can assess digital trust and conversion maturity.',
  google_business_profile_url: 'Add the Google Business Profile so local trust and visibility can be assessed.',
  average_google_rating: 'Choose the current rating so local trust and review strength are reflected in the report.',
  current_monthly_revenue: 'Add current monthly revenue so growth recommendations are grounded in reality.',
  current_challenges: 'Pick what is going wrong so the diagnosis engine can prioritise the right fixes.',
  community_type: 'Choose the community profile so local demand can be benchmarked accurately.',
  audience_types: 'Pick the audience behaviours that best fit this market.',
  expected_revenue: 'Add expected monthly revenue so we can model feasibility and break-even clearly.',
  launch_timeline: 'Choose the timeline so the launch plan reflects the real urgency.',
  break_even_expectation: 'Choose your break-even expectation so the report can compare ambition against market reality.',
  risk_tolerance: 'Choose your risk tolerance so the recommendation fits your appetite for uncertainty.',
  strategic_goals: 'Pick the founder decision goals so the report recommends the right next move.',
  expansion_goal: 'Choose the main growth goal so the report can prioritise the best expansion path.',
  growth_strategy_type: 'Choose the next move you are considering so the recommendations stay decision-ready.',
}

function formatAud(value: string): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-AU')
}

function parseMoney(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function cleanMoneyInput(value: string): string {
  return value.replace(/\D/g, '')
}

function scheduleToSummary(schedule: BusinessFormData['operating_schedule']): string {
  return schedule
    .map(day => (day.closed ? `${day.day}: Closed` : `${day.day}: ${day.open ?? 'Open'}-${day.close ?? 'Close'}`))
    .join(', ')
}

function getSchedulePreset(type: string): BusinessFormData['operating_schedule'] {
  const base = DAYS_OF_WEEK.map(day => ({ day, open: '9:00 am', close: '5:00 pm', closed: false }))
  const closedWeekend = base.map(row => row.day === 'Sunday' ? { ...row, closed: true, open: null, close: null } : row)

  switch (type) {
    case 'foodtruck_lunch':
      return base.map(row => ({ ...row, open: '11:00 am', close: '2:30 pm', closed: row.day === 'Sunday' }))
    case 'foodtruck_dinner':
      return base.map(row => ({ ...row, open: '5:00 pm', close: '9:00 pm', closed: row.day === 'Sunday' }))
    case 'foodtruck_weekend':
      return base.map(row => ({ ...row, open: row.day === 'Saturday' || row.day === 'Sunday' ? '10:00 am' : null, close: row.day === 'Saturday' || row.day === 'Sunday' ? '4:00 pm' : null, closed: !(row.day === 'Saturday' || row.day === 'Sunday') }))
    case 'foodtruck_both':
      return base.map(row => ({ ...row, open: '11:00 am', close: '8:00 pm', closed: row.day === 'Sunday' }))
    case 'cafe_commuters':
      return base.map(row => ({ ...row, open: '6:30 am', close: '2:30 pm', closed: row.day === 'Sunday' }))
    case 'cafe_breakfast':
      return base.map(row => ({ ...row, open: '7:00 am', close: '3:00 pm', closed: row.day === 'Sunday' }))
    case 'cafe_7days':
      return base.map(row => ({ ...row, open: '7:00 am', close: '3:00 pm', closed: false }))
    case 'online_24':
      return base.map(row => ({ ...row, open: '12:00 am', close: '11:30 pm', closed: false }))
    case 'online_support':
      return closedWeekend
    default:
      return closedWeekend
  }
}

function Field({
  fieldKey,
  label,
  children,
  error,
  hint,
  required,
}: {
  fieldKey?: keyof BusinessFormData | 'suburb_search'
  label: string
  children: React.ReactNode
  error?: string
  hint?: string
  required?: boolean
}) {
  return (
    <div
      data-field={fieldKey}
      className={`scroll-mt-28 rounded-2xl border px-0 py-0 transition-colors ${error ? 'border-amber-200/0' : 'border-transparent'}`}
    >
      <label className="ui-label">
        {label} {required ? '*' : ''}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-amber-700">{error}</p> : hint ? <p className="ui-helper">{hint}</p> : null}
    </div>
  )
}

function toInlineError(field: keyof BusinessFormData | 'suburb_search', error?: string) {
  if (!error) return undefined

  switch (field) {
    case 'suburb_search':
      return 'Select a suburb from the search results.'
    case 'business_type_other':
      return 'Add the business type.'
    case 'avg_price_range':
      return 'Choose a price range.'
    case 'startup_budget':
      return 'Enter a startup budget above $0.'
    case 'expected_revenue':
      return 'Enter expected monthly revenue above $0.'
    case 'current_monthly_revenue':
      return 'Enter monthly revenue above $0.'
    case 'launch_timeline':
      return 'Choose a launch timeline.'
    case 'break_even_expectation':
      return 'Choose a break-even expectation.'
    case 'operating_hours':
      return 'Complete your opening hours.'
    case 'delivery_coverage_custom':
      return 'Add the custom coverage area.'
    case 'target_age_groups':
    case 'target_customers':
    case 'audience_types':
    case 'anchor_locations':
    case 'current_challenges':
    case 'strategic_goals':
      return 'Select at least one option.'
    default:
      return 'Complete this field to continue.'
  }
}

function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select className="ui-input appearance-none pr-10" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
      <input
        className="ui-input pl-7"
        inputMode="numeric"
        placeholder={placeholder}
        value={formatAud(value)}
        onChange={e => onChange(cleanMoneyInput(e.target.value))}
      />
    </div>
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`transition-all ${
            value === option ? 'ui-segment-selected' : 'ui-segment'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function SliderField({
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-500">Current value</span>
        <span className="font-display text-lg font-semibold text-slate-900">{value}{suffix}</span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function AuditCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="ui-section">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-500">{hint}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function ToggleChips({
  options,
  values,
  onToggle,
}: {
  options: readonly string[]
  values: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const active = values.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`transition-all ${
              active ? 'ui-chip-selected' : 'ui-chip'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function BooleanCard({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-medium text-slate-900">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { text: 'No', val: false },
          { text: 'Yes', val: true },
        ].map(option => (
          <button
            key={option.text}
            type="button"
            onClick={() => onChange(option.val)}
            className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
              value === option.val
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScheduleBuilder({
  businessType,
  businessModelType,
  value,
  onChange,
}: {
  businessType: string
  businessModelType: BusinessModelType
  value: BusinessFormData['operating_schedule']
  onChange: (value: BusinessFormData['operating_schedule']) => void
}) {
  const normalizedBusinessType = businessType.toLowerCase()
  const presetOptions =
    businessModelType === 'online'
      ? [
          { label: '24/7', value: 'online_24' },
          { label: 'Support hours', value: 'online_support' },
        ]
      : /food truck/.test(normalizedBusinessType)
      ? [
          { label: 'Lunch only', value: 'foodtruck_lunch' },
          { label: 'Dinner only', value: 'foodtruck_dinner' },
          { label: 'Weekend markets', value: 'foodtruck_weekend' },
          { label: 'Lunch + dinner', value: 'foodtruck_both' },
        ]
      : /café|cafe|coffee/.test(normalizedBusinessType)
      ? [
          { label: 'Commuters', value: 'cafe_commuters' },
          { label: 'Breakfast + lunch', value: 'cafe_breakfast' },
          { label: '7 days', value: 'cafe_7days' },
        ]
      : []

  const updateDay = (day: string, next: Partial<BusinessFormData['operating_schedule'][number]>) => {
    onChange(value.map(row => row.day === day ? { ...row, ...next } : row))
  }

  const copyWeekdays = () => {
    const monday = value.find(day => day.day === 'Monday')
    if (!monday) return
    onChange(value.map(row => row.day === 'Saturday' || row.day === 'Sunday' ? row : { ...row, open: monday.open, close: monday.close, closed: monday.closed }))
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Structured schedule</div>
          <div className="mt-1 text-xs text-slate-500">Use day-by-day dropdowns so the report can reason about trading windows more accurately.</div>
        </div>
        <button type="button" onClick={copyWeekdays} className="ui-secondary-btn px-3 py-2 text-xs">
          Copy weekdays
        </button>
      </div>

      {presetOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presetOptions.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(getSchedulePreset(preset.value))}
              className="ui-chip px-3 py-1.5 text-xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {value.map(row => (
          <div key={row.day} className="grid grid-cols-[88px_1fr_1fr_92px] items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-sm font-medium text-slate-900">{row.day}</div>
            <select
              className="ui-input py-2"
              value={row.open ?? ''}
              disabled={row.closed}
              onChange={event => updateDay(row.day, { open: event.target.value || null })}
            >
              <option value="">Open</option>
              {TIME_OPTIONS.map(time => <option key={`${row.day}-${time}-open`} value={time}>{time}</option>)}
            </select>
            <select
              className="ui-input py-2"
              value={row.close ?? ''}
              disabled={row.closed}
              onChange={event => updateDay(row.day, { close: event.target.value || null })}
            >
              <option value="">Close</option>
              {TIME_OPTIONS.map(time => <option key={`${row.day}-${time}-close`} value={time}>{time}</option>)}
            </select>
            <button
              type="button"
              onClick={() => updateDay(row.day, row.closed ? { closed: false, open: '9:00 am', close: '5:00 pm' } : { closed: true, open: null, close: null })}
              className={row.closed ? 'ui-chip-selected justify-center px-3 py-2 text-xs' : 'ui-chip justify-center px-3 py-2 text-xs'}
            >
              {row.closed ? 'Closed' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalModeCards({
  value,
  onChange,
}: {
  value: UserGoalMode
  onChange: (value: UserGoalMode) => void
}) {
  return (
    <div className="space-y-3">
      {USER_GOAL_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
            className={`w-full rounded-2xl border p-5 text-left transition-all ${
            value === option.value ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className={`mb-1 font-display text-lg font-semibold ${value === option.value ? 'text-emerald-700' : 'text-slate-900'}`}>
            {option.label}
          </div>
          <div className="text-sm leading-relaxed text-slate-600">{option.description}</div>
        </button>
      ))}
    </div>
  )
}

function SuburbCombobox({
  state,
  query,
  selected,
  options,
  suggestions,
  recentSearches,
  popularNearby,
  isFiltering,
  error,
  onQueryChange,
  onSelect,
  onClear,
  onIntentPick,
}: {
  state: string
  query: string
  selected: AustraliaSuburb | null
  options: AustraliaSuburb[]
  suggestions: AustraliaSuburb[]
  recentSearches: AustraliaSuburb[]
  popularNearby: AustraliaSuburb[]
  isFiltering: boolean
  error?: string
  onQueryChange: (value: string) => void
  onSelect: (suburb: AustraliaSuburb) => void
  onClear: () => void
  onIntentPick: (intentId: string) => void
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const showMenu = Boolean(state) && open

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [query, state])

  useEffect(() => {
    if (state) {
      inputRef.current?.focus()
      setOpen(true)
    }
  }, [state])

  const visibleSuggestions = query.trim() ? options : suggestions
  const firstResult = options[0]
  const dropdownResultsMaxHeight = 'min(26rem, calc(100vh - 24rem))'

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Australian suburb lookup</div>
            <div className="mt-1 text-xs text-slate-400">Search suburb, postcode, council, or nearby area. We’ll auto-fill the postcode and coordinates.</div>
          </div>
          <div className="rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{state}</div>
        </div>
        <div className="relative">
        <MapPin className="ui-input-icon left-4 h-5 w-5 text-emerald-500" />
        <input
          ref={inputRef}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-24 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder={state ? 'Search suburb, postcode, council, or nearby area…' : 'Select a state first'}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setOpen(true)
            onQueryChange(e.target.value)
          }}
          onKeyDown={event => {
            if (!options.length) return
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setHighlightedIndex(current => Math.min(current + 1, options.length - 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setHighlightedIndex(current => Math.max(current - 1, 0))
            }
            if (event.key === 'Enter') {
              event.preventDefault()
              onSelect(options[highlightedIndex] ?? firstResult)
              setOpen(false)
            }
            if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {query ? (
            <button type="button" onClick={onClear} className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">AU only</div>
        </div>
        {showMenu && (
          <div className="relative z-20 mt-3 w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Not sure where to start?
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCATION_INTENT_SUGGESTIONS.map(intent => (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => onIntentPick(intent.id)}
                    className="ui-chip px-3 py-1.5 text-xs"
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && !query.trim() && (
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">Recent searches</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 4).map(item => (
                    <button
                      key={`${item.suburb}-${item.postcode}-recent`}
                      type="button"
                      onClick={() => {
                        onSelect(item)
                        setOpen(false)
                      }}
                      className="ui-chip px-3 py-1.5 text-xs"
                    >
                      {item.suburb} {item.postcode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {popularNearby.length > 0 && !query.trim() && (
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">Popular near you</div>
                <div className="flex flex-wrap gap-2">
                  {popularNearby.slice(0, 6).map(item => (
                    <button
                      key={`${item.suburb}-${item.postcode}-popular`}
                      type="button"
                      onClick={() => {
                        onSelect(item)
                        setOpen(false)
                      }}
                      className="ui-chip-selected px-3 py-1.5 text-xs"
                    >
                      {item.suburb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-y-auto px-3 py-3" style={{ maxHeight: dropdownResultsMaxHeight }}>
            {isFiltering ? (
              <div className="space-y-3 px-1">
                {[1, 2, 3].map(item => (
                  <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mb-2 h-3 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((option, index) => (
                <button
                  key={`${option.suburb}-${option.postcode}`}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    onSelect(option)
                    setOpen(false)
                  }}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                    index === highlightedIndex
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="mb-1 text-base font-semibold text-slate-900">{option.suburb}</div>
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" />{option.council}</span>
                      <span>•</span>
                      <span>{option.metro_zone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{getDemandHint(option)}</span>
                      <span>•</span>
                      <span>{getCommunityHint(option)}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${index === highlightedIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{option.postcode}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] capitalize ${
                      option.business_density_band === 'high'
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : option.business_density_band === 'medium'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}>
                      {option.business_density_band}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                <div className="font-medium text-slate-900">No exact suburb match yet</div>
                <div className="mt-1 text-slate-500">Try a postcode, council name, or nearby area like Glenelg, Marion, Prospect, or Norwood.</div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
      </div>

      {selected && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-50 p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <MapPinned className="h-4 w-4 text-emerald-500" />
              Selected location
            </div>
            <button type="button" onClick={onClear} className="text-xs text-slate-500 transition-colors hover:text-slate-900">Clear</button>
          </div>
          <div className="text-lg font-semibold text-emerald-700">{selected.suburb}, {selected.state} {selected.postcode}</div>
          <div className="mt-1 text-sm text-slate-600">{selected.council}</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Competition expectation</div>
              <div className="mt-1 text-sm font-medium text-slate-900 capitalize">{selected.business_density_band} local competition</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Demand angle</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{getDemandHint(selected)}</div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="ui-chip bg-white px-3 py-1 text-xs">{getCommunityHint(selected)}</span>
          </div>
          <div className="mt-3 text-sm text-slate-500">{suburbDisplayLabel(selected)}</div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Popular in {state}</div>
        <div className="flex flex-wrap gap-2">
        {suggestions.map(suggestion => (
          <button
            key={`${suggestion.suburb}-${suggestion.postcode}`}
            type="button"
            onClick={() => {
              onSelect(suggestion)
              setOpen(false)
            }}
            className="ui-chip px-3 py-2 text-xs"
          >
            {suggestion.suburb} {suggestion.postcode}
          </button>
        ))}
        </div>
      </div>
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
    </div>
  )
}

function validateStep(step: number, form: BusinessFormData): FormErrors {
  const errors: FormErrors = {}
  const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
  const isOnline = form.business_model_type === 'online' || form.business_model_type === 'hybrid'
  const businessGroup = getBusinessGroup(form)
  const isFoodHospitality = isFoodHospitalityGroup(businessGroup)
  const isRetailBusiness = isRetailGroup(businessGroup)
  const isLocalServiceBusiness = isLocalServicesGroup(businessGroup)
  const isDigitalTechBusiness = isDigitalTechGroup(businessGroup)

  if (step === 0) {
    if (!form.user_goal_mode) errors.user_goal_mode = FIELD_GUIDANCE.user_goal_mode
    if (!form.business_model_type) errors.business_model_type = FIELD_GUIDANCE.business_model_type
    if (form.user_goal_mode === 'start_new') {
      if (!form.business_type) errors.business_type = FIELD_GUIDANCE.business_type
      if (form.business_type === 'Other' && !form.business_type_other.trim()) errors.business_type_other = FIELD_GUIDANCE.business_type_other
      if (!form.business_concept.trim()) errors.business_concept = FIELD_GUIDANCE.business_concept
    }
  }

  if (step === 1) {
    if (form.user_goal_mode === 'grow_existing') {
      if (!form.business_name.trim()) errors.business_name = FIELD_GUIDANCE.business_name
      if (!form.business_type) errors.business_type = FIELD_GUIDANCE.business_type
      if (!form.products_services.trim()) errors.products_services = FIELD_GUIDANCE.products_services
      if (!form.avg_price_range) errors.avg_price_range = FIELD_GUIDANCE.avg_price_range
      if (!form.state) errors.state = FIELD_GUIDANCE.state
      if (isPhysical && !form.suburb_profile) errors.suburb_search = FIELD_GUIDANCE.suburb_search
      if (!form.business_age_band) errors.business_age_band = FIELD_GUIDANCE.business_age_band
      if (!form.premises_type) errors.premises_type = FIELD_GUIDANCE.premises_type
      if (!form.radius_km) errors.radius_km = FIELD_GUIDANCE.radius_km
    } else {
      if (!form.state) errors.state = FIELD_GUIDANCE.state
      if (isPhysical && !form.suburb_profile) errors.suburb_search = FIELD_GUIDANCE.suburb_search
      if (isPhysical && !form.radius_km) errors.radius_km = FIELD_GUIDANCE.radius_km
      if (isOnline && !form.target_market) errors.target_market = FIELD_GUIDANCE.target_market
      if (isOnline && !form.delivery_coverage) errors.delivery_coverage = FIELD_GUIDANCE.delivery_coverage
      if (!isDigitalTechBusiness && !form.demand_zone_type) errors.demand_zone_type = FIELD_GUIDANCE.demand_zone_type
      if (!isDigitalTechBusiness && !form.delivery_zone_importance) errors.delivery_zone_importance = FIELD_GUIDANCE.delivery_zone_importance
      if (!isDigitalTechBusiness && !form.anchor_locations.length) errors.anchor_locations = FIELD_GUIDANCE.anchor_locations
      if (isOnline && form.delivery_coverage === 'Custom coverage' && !form.delivery_coverage_custom.trim()) {
        errors.delivery_coverage_custom = FIELD_GUIDANCE.delivery_coverage_custom
      }
    }
  }

  if (step === 2) {
    if (form.user_goal_mode === 'grow_existing') {
      if (!form.google_business_profile_url.trim()) errors.google_business_profile_url = FIELD_GUIDANCE.google_business_profile_url
      if (!form.website_url.trim()) errors.website_url = FIELD_GUIDANCE.website_url
      if (!form.average_google_rating) errors.average_google_rating = FIELD_GUIDANCE.average_google_rating
      if (form.google_review_count < 0) errors.google_review_count = 'Keep the review count at zero or above.'
    } else {
      if (!form.audience_types.length) errors.audience_types = FIELD_GUIDANCE.audience_types
      if (!form.target_age_groups.length) errors.target_age_groups = 'Choose at least one age group so the suburb fit is more realistic.'
      if (!form.income_level) errors.income_level = 'Choose the income mix so price sensitivity can be benchmarked properly.'
      if (!form.community_type) errors.community_type = FIELD_GUIDANCE.community_type
      if (isFoodHospitality && !form.lunch_dinner_demand) errors.lunch_dinner_demand = FIELD_GUIDANCE.lunch_dinner_demand
      if ((isFoodHospitality || isRetailBusiness) && !form.weekend_traffic_level) errors.weekend_traffic_level = FIELD_GUIDANCE.weekend_traffic_level
      if ((isFoodHospitality || isLocalServiceBusiness || isDigitalTechBusiness) && !form.online_ordering_importance) errors.online_ordering_importance = FIELD_GUIDANCE.online_ordering_importance
      if ((isFoodHospitality || isRetailBusiness || isDigitalTechBusiness) && !form.foot_traffic_expectation) errors.foot_traffic_expectation = FIELD_GUIDANCE.foot_traffic_expectation
    }
  }

  if (step === 3) {
    if (form.user_goal_mode === 'grow_existing') {
      if (parseMoney(form.current_monthly_revenue) <= 0) errors.current_monthly_revenue = FIELD_GUIDANCE.current_monthly_revenue
      if (!form.current_challenges.length) errors.current_challenges = FIELD_GUIDANCE.current_challenges
    } else {
      if (!form.products_services.trim()) errors.products_services = FIELD_GUIDANCE.products_services
      if (!form.avg_price_range) errors.avg_price_range = FIELD_GUIDANCE.avg_price_range
      if (!form.target_customers.length) errors.target_customers = FIELD_GUIDANCE.target_customers
      if (!form.supply_model) errors.supply_model = FIELD_GUIDANCE.supply_model
      if (!form.launch_inventory_assumption) errors.launch_inventory_assumption = FIELD_GUIDANCE.launch_inventory_assumption
      const invalidSchedule = isPhysical && form.operating_schedule.some(day => !day.closed && (!day.open || !day.close))
      if (invalidSchedule) errors.operating_hours = 'Finish the opening hours so demand timing and staffing logic can be used properly.'
    }
  }

  if (step === 4) {
    if (form.user_goal_mode === 'start_new') {
      if (parseMoney(form.expected_revenue) <= 0) errors.expected_revenue = FIELD_GUIDANCE.expected_revenue
      if (parseMoney(form.startup_budget) <= 0) errors.startup_budget = FIELD_GUIDANCE.startup_budget
      if (!form.launch_timeline) errors.launch_timeline = FIELD_GUIDANCE.launch_timeline
      if (!form.break_even_expectation) errors.break_even_expectation = FIELD_GUIDANCE.break_even_expectation
      if (!form.risk_tolerance) errors.risk_tolerance = FIELD_GUIDANCE.risk_tolerance
    } else {
      if (!form.strategic_goals.length) errors.strategic_goals = FIELD_GUIDANCE.strategic_goals
      if (!form.expansion_goal) errors.expansion_goal = FIELD_GUIDANCE.expansion_goal
      if (!form.growth_strategy_type) errors.growth_strategy_type = FIELD_GUIDANCE.growth_strategy_type
    }
  }

  if (step === 5) {
    if (isPhysical && !form.suburb_profile) errors.suburb_search = FIELD_GUIDANCE.suburb_search
    if (isPhysical && !form.radius_km) errors.radius_km = FIELD_GUIDANCE.radius_km
  }

  return errors
}

export default function AnalyzePage() {
  const router = useRouter()
  const toast = useNotifications()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<BusinessFormData>(DEFAULT_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [suburbSearch, setSuburbSearch] = useState('')
  const [recentSearches, setRecentSearches] = useState<AustraliaSuburb[]>([])
  const [locationIntentId, setLocationIntentId] = useState<string | null>(null)
  const [isFilteringLocations, setIsFilteringLocations] = useState(false)

  const isPhysical = form.business_model_type === 'physical' || form.business_model_type === 'hybrid'
  const isOnline = form.business_model_type === 'online' || form.business_model_type === 'hybrid'
  const isDigitalOpsBusiness = isDigitalOperationsBusiness(form)
  const businessGroup = getBusinessGroup(form)
  const isFoodHospitality = isFoodHospitalityGroup(businessGroup)
  const isRetailBusiness = isRetailGroup(businessGroup)
  const isLocalServiceBusiness = isLocalServicesGroup(businessGroup)
  const isDigitalTechBusiness = isDigitalTechGroup(businessGroup)
  const productPerformanceOptions = useMemo(() => getDynamicProductServiceOptions(form), [form])
  const stepLabels = form.user_goal_mode === 'grow_existing'
    ? ['Goal', 'Snapshot', 'Digital', 'What’s Wrong', 'Next Move', 'Competitors']
    : ['Goal', 'Demand Zone', 'Market Fit', 'Setup', 'Budget', 'Competitors']
  const totalSteps = stepLabels.length

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as BusinessFormData
        setForm({
          ...DEFAULT_FORM,
          ...parsed,
          suburb_profile: parsed.suburb_profile ?? null,
          operating_schedule: parsed.operating_schedule ?? DEFAULT_FORM.operating_schedule,
          anchor_locations: parsed.anchor_locations ?? [],
          target_customers: parsed.target_customers ?? [],
          current_challenges: parsed.current_challenges ?? [],
          best_selling_products: parsed.best_selling_products ?? [],
          worst_performing_products: parsed.worst_performing_products ?? [],
          busiest_trading_days: parsed.busiest_trading_days ?? [],
          quietest_trading_days: parsed.quietest_trading_days ?? [],
          target_age_groups: parsed.target_age_groups ?? [],
          audience_types: parsed.audience_types ?? [],
          best_traffic_channels: parsed.best_traffic_channels ?? [],
          best_converting_offers: parsed.best_converting_offers ?? [],
          lead_sources: parsed.lead_sources ?? [],
          peak_enquiry_periods: parsed.peak_enquiry_periods ?? [],
          strongest_acquisition_channels: parsed.strongest_acquisition_channels ?? [],
          social_media_channels: parsed.social_media_channels ?? [],
          delivery_platform_usage: parsed.delivery_platform_usage ?? [],
        })
        setSuburbSearch(parsed.suburb ? `${parsed.suburb}${parsed.postcode ? ` ${parsed.postcode}` : ''}` : '')
      }
      const recent = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (recent) setRecentSearches(JSON.parse(recent) as AustraliaSuburb[])
    } catch {
      // ignore draft issues
    }

    fetch('/api/daily-count')
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (data) setRemaining(data.remaining)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // ignore draft save issues
    }
  }, [form])

  useEffect(() => {
    setErrors(validateStep(step, form))
  }, [form, step])

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0)
      return
    }
    let index = 0
    const timer = setInterval(() => {
      index = (index + 1) % LOADING_STAGES.length
      setLoadingStage(index)
    }, 2400)
    return () => clearInterval(timer)
  }, [loading])

  useEffect(() => {
    if (step !== 1 || !form.state) return
    setIsFilteringLocations(true)
    const timer = setTimeout(() => setIsFilteringLocations(false), 180)
    return () => clearTimeout(timer)
  }, [step, suburbSearch, locationIntentId, form.state])

  const suburbOptions = useMemo(() => {
    if (!form.state) return []
    if (locationIntentId && !suburbSearch.trim()) return getLocationIntentResults(form.state, locationIntentId)
    return searchSuburbs(form.state, suburbSearch)
  }, [form.state, suburbSearch, locationIntentId])

  const suburbSuggestions = useMemo(() => (form.state ? getPopularSuburbSuggestions(form.state) : []), [form.state])
  const popularNearby = useMemo(() => suburbSuggestions.slice(0, 6), [suburbSuggestions])
  const currentStepErrors = errors
  const currentStepValid = Object.keys(currentStepErrors).length === 0
  const shouldShowFieldError = (field: keyof BusinessFormData | 'suburb_search') => touchedFields.has(field) || attemptedSteps.has(step)
  const visibleError = (field: keyof BusinessFormData | 'suburb_search') => shouldShowFieldError(field) ? toInlineError(field, errors[field]) : undefined
  const markFieldTouched = (...fields: Array<keyof BusinessFormData | 'suburb_search'>) => {
    setTouchedFields(prev => {
      const next = new Set(prev)
      fields.forEach(field => next.add(field))
      return next
    })
  }

  const getFieldOrderForStep = (targetStep: number) => {
    if (form.user_goal_mode === 'grow_existing') {
      return GROW_EXISTING_STEP_FIELD_ORDER[targetStep] ?? []
    }
    return getStartNewStepFieldOrder(businessGroup, form)[targetStep] ?? []
  }

  const focusFirstMissingField = (nextErrors: FormErrors, targetStep: number) => {
    if (typeof document === 'undefined') return
    const orderedKeys = getFieldOrderForStep(targetStep)
    const firstKey = orderedKeys.find(key => Boolean(nextErrors[key as keyof FormErrors])) ?? Object.keys(nextErrors)[0]
    if (!firstKey) return
    const container = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null
    if (!container) return
    container.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => {
      const focusTarget = container.querySelector('input, select, textarea, button') as HTMLElement | null
      focusTarget?.focus()
    }, 120)
  }

  const buildStepHelperText = (nextErrors: FormErrors, targetStep: number) => {
    const orderedKeys = getFieldOrderForStep(targetStep)
    const missing = orderedKeys.filter(key => Boolean(nextErrors[key as keyof FormErrors]))
    if (!missing.length) return ''
    const first = FIELD_GUIDANCE[missing[0]]
    if (missing.length === 1) return first
    return `${first} ${missing.length - 1} more detail${missing.length === 2 ? '' : 's'} will unlock the next step.`
  }

  const setField = <K extends keyof BusinessFormData>(field: K, value: BusinessFormData[K]) => {
    markFieldTouched(field)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const setOperatingSchedule = (schedule: BusinessFormData['operating_schedule']) => {
    markFieldTouched('operating_hours')
    setForm(prev => ({
      ...prev,
      operating_schedule: schedule,
      operating_hours: scheduleToSummary(schedule),
    }))
  }

  const toggleArrayValue = (
    field:
      | 'target_customers'
      | 'anchor_locations'
      | 'current_challenges'
      | 'best_selling_products'
      | 'worst_performing_products'
      | 'busiest_trading_days'
      | 'quietest_trading_days'
      | 'target_age_groups'
      | 'audience_types'
      | 'best_traffic_channels'
      | 'best_converting_offers'
      | 'lead_sources'
      | 'peak_enquiry_periods'
      | 'strongest_acquisition_channels'
      | 'strategic_goals'
      | 'social_media_channels'
      | 'delivery_platform_usage',
    value: string
  ) => {
    setForm(prev => {
      const current = prev[field]
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      return { ...prev, [field]: next }
    })
    markFieldTouched(field)
  }

  const handleSuburbSelect = (suburb: AustraliaSuburb) => {
    markFieldTouched('suburb_search', 'state')
    setForm(prev => ({
      ...prev,
      state: suburb.state,
      suburb: suburb.suburb,
      postcode: suburb.postcode,
      city: suburb.city,
      lat: suburb.lat,
      lng: suburb.lng,
      suburb_profile: suburb,
      current_location_suburb: prev.current_location_suburb || suburb.suburb,
    }))
    setSuburbSearch(`${suburb.suburb} ${suburb.postcode}`)
    setLocationIntentId(null)
    setRecentSearches(prev => {
      const next = [suburb, ...prev.filter(item => !(item.suburb === suburb.suburb && item.postcode === suburb.postcode))].slice(0, 6)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handleSuburbInput = (value: string) => {
    markFieldTouched('suburb_search')
    setSuburbSearch(value)
    setLocationIntentId(null)
    const match = form.state ? findSuburbByFlexibleQuery(form.state, value) : null
    if (!match) {
      setForm(prev => ({ ...prev, suburb: '', postcode: '', city: '', lat: null, lng: null, suburb_profile: null }))
    }
  }

  const clearSelectedSuburb = () => {
    markFieldTouched('suburb_search')
    setSuburbSearch('')
    setLocationIntentId(null)
    setForm(prev => ({ ...prev, suburb: '', postcode: '', city: '', lat: null, lng: null, suburb_profile: null }))
  }

  const validateSpecificStep = (targetStep: number) => {
    const nextErrors = validateStep(targetStep, form)
    setErrors(nextErrors)
    return nextErrors
  }

  const validateCurrentStep = () => {
    const nextErrors = validateSpecificStep(step)
    return Object.keys(nextErrors).length === 0
  }

  const validateJourney = () => {
    const allErrors: FormErrors = {}
    for (let current = 0; current < totalSteps; current += 1) {
      Object.assign(allErrors, validateStep(current, form))
    }
    setErrors(allErrors)
    return allErrors
  }

  const getFirstInvalidStep = (allErrors: FormErrors) => {
    for (let current = 0; current < totalSteps; current += 1) {
      const stepKeys = getFieldOrderForStep(current)
      if (stepKeys.some(key => Boolean(allErrors[key as keyof FormErrors]))) return current
    }
    return step
  }

  const handleBack = () => (step > 0 ? setStep(current => current - 1) : router.push('/'))

  const handleNext = () => {
    const nextErrors = validateSpecificStep(step)
    if (Object.keys(nextErrors).length === 0) {
      setStep(current => current + 1)
      return
    }
    setAttemptedSteps(prev => new Set(prev).add(step))
    focusFirstMissingField(nextErrors, step)
  }

  const handleSubmit = async () => {
    const nextErrors = validateJourney()
    if (Object.keys(nextErrors).length > 0) {
      const invalidStep = getFirstInvalidStep(nextErrors)
      setAttemptedSteps(prev => new Set(prev).add(invalidStep))
      focusFirstMissingField(nextErrors, invalidStep)
      return
    }

    if (remaining !== null && remaining <= 0) {
      router.push('/waitlist')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        throw new Error(`Server error (${response.status}).`)
      }

      const data = (await response.json()) as AnalyzeResponse & { _temp?: boolean }

      if (response.status === 429 || ('error' in data && data.error === 'DAILY_LIMIT_REACHED')) {
        router.push('/waitlist')
        return
      }

      if (!response.ok || !data.success) {
        throw new Error(('error' in data ? data.error : null) || 'Analysis failed')
      }

      if (data._temp && 'report' in data) {
        try {
          sessionStorage.setItem(
            `${TEMP_REPORT_KEY}_${data.reportId}`,
            JSON.stringify({
              id: data.reportId,
              created_at: new Date().toISOString(),
              user_goal_mode: form.user_goal_mode,
              state: form.state,
              city: form.city,
              suburb: form.suburb,
              postcode: form.postcode,
              business_type: form.business_type,
              business_type_other: form.business_type_other,
              business_model_type: form.business_model_type,
              products_services: form.products_services,
              avg_price_range: form.avg_price_range,
              operating_hours: form.operating_hours,
              radius_km: form.radius_km,
              lat: form.lat,
              lng: form.lng,
              competitors: data.report.nearby_data?.competitors ?? [],
              competitor_stats: {
                total: data.report.nearby_data?.total_found ?? 0,
                strong: data.report.nearby_data?.strong_count ?? 0,
                moderate: data.report.nearby_data?.moderate_count ?? 0,
                weak: data.report.nearby_data?.weak_count ?? 0,
                avg_rating: data.report.nearby_data?.avg_rating ?? null,
                density: data.report.nearby_data?.competitor_density ?? 'low',
              },
              analysis: data.report,
            })
          )
        } catch {
          // ignore temp cache issues
        }
      }

      localStorage.removeItem(STORAGE_KEY)
      router.push(`/report/${data.reportId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft size={16} />
          GlobalBiz AI
        </Link>
        <span className="font-display text-sm font-bold text-slate-900">
          GlobalBiz <span className="text-brand-500">AI</span>
        </span>
        {remaining !== null ? <span className="text-xs text-slate-500">{remaining} free reports left today</span> : <span />}
      </div>

      <StepProgress step={step} totalSteps={totalSteps} labels={stepLabels} />

      <div className="mx-auto flex-1 w-full max-w-3xl px-6 py-8">
        <div className="space-y-5 fade-up">
          {!currentStepValid ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {buildStepHelperText(currentStepErrors, step)}
            </div>
          ) : null}

          {step === 0 && (
            <>
              <div data-field="user_goal_mode" className="scroll-mt-28">
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">What do you want to do?</h2>
                <p className="text-sm text-slate-500">Choose the business goal first, then tell us whether this is physical, online, or hybrid.</p>
              </div>
              <GoalModeCards value={form.user_goal_mode} onChange={value => setField('user_goal_mode', value)} />

              <div data-field="business_model_type" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="mb-1 text-xl font-display font-semibold text-slate-900">What type of business is this?</h3>
                  <p className="text-sm text-slate-500">This controls the location, competitor, and delivery analysis logic.</p>
                </div>
                <BusinessModelStep value={form.business_model_type as BusinessModelType | ''} onChange={value => setField('business_model_type', value)} />
                {visibleError('business_model_type') ? <p className="mt-2 text-xs text-amber-700">{visibleError('business_model_type')}</p> : null}
              </div>

              {form.user_goal_mode === 'start_new' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field fieldKey="business_type" label="Business category" required error={visibleError('business_type')} hint="Choose the category closest to the idea you want to validate.">
                    <Select options={BUSINESS_TYPES} value={form.business_type} onChange={value => setField('business_type', value)} placeholder="Choose business category..." />
                  </Field>
                  {form.business_type === 'Other' ? (
                    <Field fieldKey="business_type_other" label="What is the business type?" required error={visibleError('business_type_other')}>
                      <input className="form-input" value={form.business_type_other} onChange={e => setField('business_type_other', e.target.value)} placeholder="Example: specialty pet bakery" />
                    </Field>
                  ) : <div className="hidden sm:block" />}
                  <div className="sm:col-span-2">
                    <Field fieldKey="business_concept" label="One-line concept" required error={visibleError('business_concept')} hint="Keep this short. We use it to anchor the market-validation logic before we get into setup details.">
                      <input className="form-input" value={form.business_concept} onChange={e => setField('business_concept', e.target.value)} placeholder="Example: premium lunch-focused food truck for office workers in Adelaide CBD" />
                    </Field>
                  </div>
                  {form.business_type ? (
                    <div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
                      <div className="font-medium text-slate-900">Adaptive journey: {getBusinessGroupLabel(businessGroup)}</div>
                      <div className="mt-1">
                        {isDigitalTechBusiness
                          ? 'This workflow will focus more on online acquisition, trust, and positioning than meal-time or foot-traffic assumptions.'
                          : isRetailBusiness
                          ? 'This workflow will focus on household demand, convenience, repeat shopping, and nearby retail pressure.'
                          : isLocalServiceBusiness
                          ? 'This workflow will focus on service radius, trust, reviews, and booking behaviour.'
                          : 'This workflow will focus on meal-time demand, foot traffic, delivery relevance, and repeat local demand.'}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            form.user_goal_mode === 'grow_existing' ? (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Current business snapshot</h2>
                <p className="text-sm text-slate-500">Capture the current business context so the report can diagnose what is underperforming and who is competing nearby.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field fieldKey="business_name" label="Business name" required error={visibleError('business_name')}>
                  <input className="form-input" value={form.business_name} onChange={e => setField('business_name', e.target.value)} placeholder="Example: Oaklands Fresh Market" />
                </Field>
                <Field fieldKey="business_type" label="Business category" required error={visibleError('business_type')}>
                  <Select options={BUSINESS_TYPES} value={form.business_type} onChange={value => setField('business_type', value)} placeholder="Choose category..." />
                </Field>
                <div className="sm:col-span-2">
                  <Field fieldKey="products_services" label="What does the business do?" required error={visibleError('products_services')}>
                    <textarea className="form-input resize-none" rows={3} value={form.products_services} onChange={e => setField('products_services', e.target.value)} placeholder="Describe the products, services, and current offer." />
                  </Field>
                </div>
                <Field fieldKey="avg_price_range" label="Average price range" required error={visibleError('avg_price_range')} hint="This helps benchmark whether your pricing is aligned with local competitors.">
                  <Select options={['Under $10', '$10–$30', '$30–$60', '$60–$100', '$100–$250', '$250–$500', '$500+', 'Custom quote']} value={form.avg_price_range} onChange={value => setField('avg_price_range', value)} placeholder="Choose price range..." />
                </Field>
                <Field label="Best-selling offer price" hint="Optional. Add the headline offer price customers buy most often.">
                  <CurrencyInput value={form.best_selling_offer_price} onChange={value => setField('best_selling_offer_price', value)} placeholder="29" />
                </Field>
                <Field label="Premium upsell price" hint="Optional. Useful if you have a higher-ticket version, bundle, or premium service.">
                  <CurrencyInput value={form.premium_upsell_price} onChange={value => setField('premium_upsell_price', value)} placeholder="89" />
                </Field>
                <Field fieldKey="state" label="State or territory" required error={visibleError('state')}>
                  <Select options={AU_STATES} value={form.state} onChange={value => setField('state', value)} placeholder="Select state or territory..." />
                </Field>
                <Field fieldKey="business_age_band" label="Business age" required error={visibleError('business_age_band')}>
                  <Select options={BUSINESS_AGE_OPTIONS} value={form.business_age_band} onChange={value => setField('business_age_band', value)} placeholder="Choose operating age..." />
                </Field>
                {form.state && (
                  <div className="sm:col-span-2">
                    <Field fieldKey="suburb_search" label="Current suburb" required error={undefined}>
                      <SuburbCombobox
                        state={form.state}
                        query={suburbSearch}
                        selected={form.suburb_profile}
                        options={suburbOptions}
                        suggestions={suburbSuggestions}
                        recentSearches={recentSearches.filter(item => item.state === form.state)}
                        popularNearby={popularNearby}
                        isFiltering={isFilteringLocations}
                        error={visibleError('suburb_search')}
                        onQueryChange={handleSuburbInput}
                        onSelect={suburb => {
                          handleSuburbSelect(suburb)
                          setField('current_location_suburb', suburb.suburb)
                        }}
                        onClear={clearSelectedSuburb}
                        onIntentPick={intentId => {
                          setLocationIntentId(intentId)
                          setSuburbSearch('')
                        }}
                      />
                    </Field>
                  </div>
                )}
                <Field fieldKey="radius_km" label="Competitor radius" required error={visibleError('radius_km')}>
                  <div className="grid grid-cols-4 gap-2">
                    {RADIUS_OPTIONS.map(radius => (
                      <button key={radius} type="button" onClick={() => setField('radius_km', radius)} className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${form.radius_km === radius ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'}`}>
                        {radius}km
                      </button>
                    ))}
                  </div>
                </Field>
                <Field fieldKey="premises_type" label="Premises" required error={visibleError('premises_type')}>
                  <SegmentedControl options={PREMISES_TYPE_OPTIONS} value={form.premises_type} onChange={value => setField('premises_type', value as BusinessFormData['premises_type'])} />
                </Field>
                <Field label="Business model">
                  <BusinessModelStep value={form.business_model_type as BusinessModelType | ''} onChange={value => setField('business_model_type', value)} />
                </Field>
                <Field label="Team size">
                  <input className="form-input" type="number" min={1} value={form.current_team_size} onChange={e => setField('current_team_size', Math.max(1, Number(e.target.value) || 1))} />
                </Field>
              </div>
            </>
            ) : (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Location & demand zone</h2>
                <p className="text-sm text-slate-500">
                  {isDigitalTechBusiness
                    ? 'Set the operating base and market reach first. For digital and tech businesses, broader market reach usually matters more than local foot traffic.'
                    : isPhysical
                    ? 'Pick the suburb and radius first, then tell us what kind of demand zone surrounds it.'
                    : 'Choose the Australian market you want to serve and the delivery realities that will shape demand and competition.'}
                </p>
              </div>

              <Field fieldKey="state" label="State or territory" required error={visibleError('state')}>
                <Select
                  options={AU_STATES}
                  value={form.state}
                  onChange={value => {
                    setForm(prev => ({
                      ...prev,
                      state: value,
                      suburb: '',
                      postcode: '',
                      city: '',
                      lat: null,
                      lng: null,
                      suburb_profile: null,
                    }))
                    setSuburbSearch('')
                  }}
                  placeholder="Select state or territory..."
                />
              </Field>

              {isPhysical && form.state && (
                <Field fieldKey="suburb_search" label="Suburb lookup" required hint="Premium suburb search with council, postcode, and area guidance for Australian business owners.">
                  <SuburbCombobox
                    state={form.state}
                    query={suburbSearch}
                    selected={form.suburb_profile}
                    options={suburbOptions}
                    suggestions={suburbSuggestions}
                    recentSearches={recentSearches.filter(item => item.state === form.state)}
                    popularNearby={popularNearby}
                    isFiltering={isFilteringLocations}
                    error={visibleError('suburb_search')}
                    onQueryChange={handleSuburbInput}
                    onSelect={handleSuburbSelect}
                    onClear={clearSelectedSuburb}
                    onIntentPick={intentId => {
                      setLocationIntentId(intentId)
                      setSuburbSearch('')
                    }}
                  />
                </Field>
              )}

              {form.suburb_profile && (
                <div className="ui-section">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Store className="h-4 w-4 text-emerald-500" />
                    Selected location preview
                  </div>
                  <div className="text-xl font-semibold text-slate-900">{form.suburb_profile.suburb}, {form.suburb_profile.state} {form.suburb_profile.postcode}</div>
                  <div className="mt-1 text-sm text-slate-600">{form.suburb_profile.council}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="ui-chip px-3 py-1 text-xs">{getDemandHint(form.suburb_profile)}</span>
                    <span className="ui-chip px-3 py-1 text-xs">{getCommunityHint(form.suburb_profile)}</span>
                    <span className="ui-chip px-3 py-1 text-xs">{form.suburb_profile.metro_zone}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="ui-info-box">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Suburb</div>
                      <div className="mt-1 text-sm text-slate-900">{form.suburb_profile.suburb}</div>
                    </div>
                    <div className="ui-info-box">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Postcode</div>
                      <div className="mt-1 text-sm text-slate-900">{form.suburb_profile.postcode}</div>
                    </div>
                    <div className="ui-info-box">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Council</div>
                      <div className="mt-1 text-sm text-slate-900">{form.suburb_profile.council}</div>
                    </div>
                    <div className="ui-info-box">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Area</div>
                      <div className="mt-1 text-sm text-slate-900">{form.suburb_profile.metro_zone}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {isPhysical && (
                  <Field fieldKey="radius_km" label="Competitor radius" required error={visibleError('radius_km')} hint="This controls the real Google Maps scan and density score.">
                    <div className="grid grid-cols-4 gap-2">
                      {RADIUS_OPTIONS.map(radius => (
                        <button
                          key={radius}
                          type="button"
                          onClick={() => setField('radius_km', radius)}
                          className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                            form.radius_km === radius
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          {radius}km
                        </button>
                      ))}
                    </div>
                  </Field>
                )}

                {!isDigitalTechBusiness ? (
                  <>
                    <Field fieldKey="demand_zone_type" label="Demand zone" required error={visibleError('demand_zone_type')} hint="Think about what surrounds the site: schools, offices, tourists, or mostly local households.">
                      <Select options={DEMAND_ZONE_OPTIONS} value={form.demand_zone_type} onChange={value => setField('demand_zone_type', value)} placeholder="Choose demand zone..." />
                    </Field>

                    <Field fieldKey="delivery_zone_importance" label={isLocalServiceBusiness ? 'Service coverage importance' : 'Delivery zone importance'} required error={visibleError('delivery_zone_importance')} hint={isLocalServiceBusiness ? 'Useful for judging whether response time and service reach matter more than walk-by traffic.' : 'Useful for judging whether convenience and reach matter more than raw foot traffic.'}>
                      <SegmentedControl options={DELIVERY_ZONE_IMPORTANCE_OPTIONS} value={form.delivery_zone_importance} onChange={value => setField('delivery_zone_importance', value)} />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field fieldKey="anchor_locations" label={isRetailBusiness ? 'Retail anchors nearby' : 'Anchor locations nearby'} required error={visibleError('anchor_locations')} hint={isRetailBusiness ? 'Pick the retail magnets nearby so we can judge convenience, chains, and habitual shopping demand.' : 'Pick the traffic magnets near this suburb so the report can reason about real demand drivers.'}>
                        <ToggleChips options={ANCHOR_LOCATION_OPTIONS} values={form.anchor_locations} onToggle={value => toggleArrayValue('anchor_locations', value)} />
                      </Field>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
                    For digital and tech businesses, this step focuses on operating base and market reach. Physical anchors and lunch-time patterns matter less unless the business is hybrid or highly local.
                  </div>
                )}
              </div>

              {isOnline && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field fieldKey="target_market" label="Target Australian market" required error={visibleError('target_market')}>
                    <Select options={TARGET_MARKET_OPTIONS} value={form.target_market} onChange={value => setField('target_market', value)} placeholder="Choose market..." />
                  </Field>
                  <Field
                    fieldKey="delivery_coverage"
                    label="Delivery / service coverage"
                    required
                    error={visibleError('delivery_coverage') || visibleError('delivery_coverage_custom')}
                    hint={form.business_model_type === 'online' ? 'This is strongly recommended for online businesses.' : 'Tell us how far the hybrid model can serve customers.'}
                  >
                    <Select
                      options={DELIVERY_COVERAGE_OPTIONS}
                      value={form.delivery_coverage}
                      onChange={value => {
                        setField('delivery_coverage', value)
                        if (value !== 'Custom coverage') setField('delivery_coverage_custom', '')
                      }}
                      placeholder="Choose coverage..."
                    />
                  </Field>
                  {form.delivery_coverage === 'Custom coverage' && (
                    <div className="sm:col-span-2">
                      <Field fieldKey="delivery_coverage_custom" label="Custom coverage details" required error={visibleError('delivery_coverage_custom')}>
                        <textarea
                          className="form-input resize-none"
                          rows={3}
                          placeholder="Example: Adelaide metro plus Mount Barker, Victor Harbor, and selected Melbourne suburbs."
                          value={form.delivery_coverage_custom}
                          onChange={e => setField('delivery_coverage_custom', e.target.value)}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              )}
            </>
            )
          )}

          {step === 2 && (
            form.user_goal_mode === 'grow_existing' ? (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Digital footprint</h2>
                <p className="text-sm text-slate-500">Capture the channels and trust signals that shape local discovery, SEO visibility, and social proof.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field fieldKey="website_url" label="Website URL" required error={visibleError('website_url')}>
                  <input className="form-input" placeholder="https://yourbusiness.com.au" value={form.website_url} onChange={e => setField('website_url', e.target.value)} />
                </Field>
                <Field fieldKey="google_business_profile_url" label="Google Business Profile URL" required error={visibleError('google_business_profile_url')}>
                  <input className="form-input" placeholder="https://g.page/..." value={form.google_business_profile_url} onChange={e => setField('google_business_profile_url', e.target.value)} />
                </Field>
                <Field label="Instagram">
                  <input className="form-input" placeholder="https://instagram.com/yourbrand" value={form.instagram_url} onChange={e => setField('instagram_url', e.target.value)} />
                </Field>
                <Field label="Facebook">
                  <input className="form-input" placeholder="https://facebook.com/yourbrand" value={form.facebook_url} onChange={e => setField('facebook_url', e.target.value)} />
                </Field>
                <Field label="TikTok">
                  <input className="form-input" placeholder="https://tiktok.com/@yourbrand" value={form.tiktok_url} onChange={e => setField('tiktok_url', e.target.value)} />
                </Field>
                <Field fieldKey="average_google_rating" label="Google review rating" required error={visibleError('average_google_rating')}>
                  <SegmentedControl options={['3.5', '4.0', '4.3', '4.6', '4.8+']} value={form.average_google_rating} onChange={value => setField('average_google_rating', value)} />
                </Field>
                <Field label="Review count">
                  <input className="form-input" type="number" min={0} value={form.google_review_count} onChange={e => setField('google_review_count', Math.max(0, Number(e.target.value) || 0))} />
                </Field>
                <Field label="Estimated website traffic">
                  <input className="form-input" type="number" min={0} value={form.average_monthly_website_visitors} onChange={e => setField('average_monthly_website_visitors', Math.max(0, Number(e.target.value) || 0))} />
                </Field>
                <Field label="Followers">
                  <input className="form-input" type="number" min={0} value={form.instagram_followers} onChange={e => setField('instagram_followers', Math.max(0, Number(e.target.value) || 0))} />
                </Field>
                <Field label="Engagement rate">
                  <SliderField value={form.average_post_engagement} min={0} max={20} suffix="%" onChange={value => setField('average_post_engagement', value)} />
                </Field>
              </div>
            </>
            ) : (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Market & customer fit</h2>
                <p className="text-sm text-slate-500">
                  {isDigitalTechBusiness
                    ? 'Focus on customer segment, trust expectations, and how competitive the online market will feel before you think about delivery or staffing.'
                    : 'Focus on the outside world here: who is nearby, when demand happens, and how the suburb behaves before you think about operations.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field fieldKey="community_type" label="Community type" required error={visibleError('community_type')}>
                  <Select options={COMMUNITY_TYPES} value={form.community_type} onChange={value => setField('community_type', value)} placeholder="Choose community type..." />
                </Field>
                <Field fieldKey="income_level" label="Income level" required error={visibleError('income_level')}>
                  <Select options={INCOME_LEVEL_OPTIONS} value={form.income_level} onChange={value => setField('income_level', value)} placeholder="Choose income mix..." />
                </Field>
                <div className="sm:col-span-2">
                  <Field fieldKey="audience_types" label="Local audience type" required error={visibleError('audience_types')} hint="Pick who naturally moves through this suburb or demand pocket.">
                    <ToggleChips options={AUDIENCE_TYPE_OPTIONS} values={form.audience_types} onToggle={value => toggleArrayValue('audience_types', value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field fieldKey="target_age_groups" label="Age groups" required error={visibleError('target_age_groups')} hint="This helps us judge whether the suburb’s demographic profile fits the idea.">
                    <ToggleChips options={AGE_GROUP_OPTIONS} values={form.target_age_groups} onToggle={value => toggleArrayValue('target_age_groups', value)} />
                  </Field>
                </div>
                {isFoodHospitality ? (
                  <>
                    <Field fieldKey="lunch_dinner_demand" label="Meal-time demand" required error={visibleError('lunch_dinner_demand')}>
                      <Select options={LUNCH_DINNER_DEMAND_OPTIONS} value={form.lunch_dinner_demand} onChange={value => setField('lunch_dinner_demand', value)} placeholder="Choose demand pattern..." />
                    </Field>
                    <Field fieldKey="weekend_traffic_level" label="Weekend traffic" required error={visibleError('weekend_traffic_level')}>
                      <Select options={WEEKEND_TRAFFIC_OPTIONS} value={form.weekend_traffic_level} onChange={value => setField('weekend_traffic_level', value)} placeholder="Choose weekend traffic..." />
                    </Field>
                    <Field fieldKey="online_ordering_importance" label="Online ordering importance" required error={visibleError('online_ordering_importance')}>
                      <SegmentedControl options={IMPORTANCE_OPTIONS} value={form.online_ordering_importance} onChange={value => setField('online_ordering_importance', value)} />
                    </Field>
                    <Field fieldKey="foot_traffic_expectation" label="Foot traffic expectation" required error={visibleError('foot_traffic_expectation')}>
                      <SegmentedControl options={FOOT_TRAFFIC_OPTIONS} value={form.foot_traffic_expectation} onChange={value => setField('foot_traffic_expectation', value)} />
                    </Field>
                  </>
                ) : null}
                {isRetailBusiness ? (
                  <>
                    <Field fieldKey="weekend_traffic_level" label="Weekend shopping traffic" required error={visibleError('weekend_traffic_level')}>
                      <Select options={WEEKEND_TRAFFIC_OPTIONS} value={form.weekend_traffic_level} onChange={value => setField('weekend_traffic_level', value)} placeholder="Choose weekend traffic..." />
                    </Field>
                    <Field fieldKey="foot_traffic_expectation" label="Foot traffic expectation" required error={visibleError('foot_traffic_expectation')}>
                      <SegmentedControl options={FOOT_TRAFFIC_OPTIONS} value={form.foot_traffic_expectation} onChange={value => setField('foot_traffic_expectation', value)} />
                    </Field>
                  </>
                ) : null}
                {isLocalServiceBusiness ? (
                  <Field fieldKey="online_ordering_importance" label="Booking and online enquiry importance" required error={visibleError('online_ordering_importance')}>
                    <SegmentedControl options={IMPORTANCE_OPTIONS} value={form.online_ordering_importance} onChange={value => setField('online_ordering_importance', value)} />
                  </Field>
                ) : null}
                {isDigitalTechBusiness ? (
                  <>
                    <Field fieldKey="online_ordering_importance" label="SEO / online visibility importance" required error={visibleError('online_ordering_importance')}>
                      <SegmentedControl options={IMPORTANCE_OPTIONS} value={form.online_ordering_importance} onChange={value => setField('online_ordering_importance', value)} />
                    </Field>
                    <Field fieldKey="foot_traffic_expectation" label="Digital competition intensity" required error={visibleError('foot_traffic_expectation')}>
                      <SegmentedControl options={['Low', 'Moderate', 'High', 'Very high']} value={form.foot_traffic_expectation} onChange={value => setField('foot_traffic_expectation', value)} />
                    </Field>
                  </>
                ) : null}
              </div>
            </>
            )
          )}

          {step === 3 && (
            form.user_goal_mode === 'grow_existing' ? (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">What is going wrong?</h2>
                <p className="text-sm text-slate-500">Choose the current pain points so the diagnosis engine can prioritise what to fix first.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field fieldKey="current_challenges" label="Pain points" required error={visibleError('current_challenges')}>
                    <ToggleChips options={['sales dropping','low foot traffic','customers not returning','strong competitors nearby','weak online presence','poor Google reviews','low margins','staffing issues','expansion uncertainty','product mix confusion','just doing market research']} values={form.current_challenges} onToggle={value => toggleArrayValue('current_challenges', value)} />
                  </Field>
                </div>
                <Field fieldKey="current_monthly_revenue" label="Current monthly revenue" required error={visibleError('current_monthly_revenue')}>
                  <CurrencyInput value={form.current_monthly_revenue} onChange={value => setField('current_monthly_revenue', value)} placeholder="40,000" />
                </Field>
                <Field label="Target monthly revenue">
                  <CurrencyInput value={form.target_monthly_revenue} onChange={value => setField('target_monthly_revenue', value)} placeholder="55,000" />
                </Field>
                <Field label="Repeat customer rate">
                  <SliderField value={form.repeat_customer_rate} min={0} max={100} suffix="%" onChange={value => setField('repeat_customer_rate', value)} />
                </Field>
                <Field label="Average basket / order value">
                  <CurrencyInput value={form.average_basket_value} onChange={value => setField('average_basket_value', value)} placeholder="32" />
                </Field>
              </div>
            </>
            ) : (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Business setup</h2>
                <p className="text-sm text-slate-500">
                  {isDigitalTechBusiness
                    ? 'Now switch to the internal model: pricing structure, support coverage, team shape, and fulfilment assumptions.'
                    : 'Now switch to the inside of the business: offer structure, pricing, staffing, hours, and supply assumptions.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field fieldKey="products_services" label="Products / services" required error={visibleError('products_services')}>
                    <textarea
                      className="form-input resize-none"
                      rows={3}
                      placeholder="Describe the core menu, offer stack, service package, or product mix."
                      value={form.products_services}
                      onChange={e => setField('products_services', e.target.value)}
                    />
                  </Field>
                </div>
                <Field fieldKey="avg_price_range" label="Average price range" required error={visibleError('avg_price_range')}>
                  <Select options={PRICE_RANGE_OPTIONS} value={form.avg_price_range} onChange={value => setField('avg_price_range', value)} placeholder="Choose price range..." />
                </Field>
                <Field label="Expected staff count">
                  <input className="form-input" type="number" min={1} value={form.staff_count} onChange={e => setField('staff_count', Math.max(1, Number(e.target.value) || 1))} />
                </Field>
                {isPhysical && (
                  <div className="sm:col-span-2">
                    <Field fieldKey="operating_hours" label={isDigitalTechBusiness ? 'Support hours' : 'Structured opening hours'} error={visibleError('operating_hours')} hint={isDigitalTechBusiness ? 'These hours help the report reason about response windows, support expectations, and staffing coverage.' : 'These hours now feed the report, timing advice, revenue forecast, and staffing logic.'}>
                      <ScheduleBuilder
                        businessType={form.business_type === 'Other' ? form.business_type_other : form.business_type}
                        businessModelType={form.business_model_type}
                        value={form.operating_schedule}
                        onChange={setOperatingSchedule}
                      />
                    </Field>
                  </div>
                )}
                <Field fieldKey="supply_model" label={isDigitalTechBusiness ? 'Delivery / fulfilment model' : 'Supply model'} required error={visibleError('supply_model')}>
                  <Select options={SUPPLY_MODEL_OPTIONS} value={form.supply_model} onChange={value => setField('supply_model', value)} placeholder="Choose supply model..." />
                </Field>
                <Field fieldKey="launch_inventory_assumption" label={isDigitalTechBusiness ? 'Onboarding / fulfilment assumption' : 'Launch inventory assumption'} required error={visibleError('launch_inventory_assumption')}>
                  <Select options={INVENTORY_ASSUMPTION_OPTIONS} value={form.launch_inventory_assumption} onChange={value => setField('launch_inventory_assumption', value)} placeholder="Choose inventory plan..." />
                </Field>
                <div className="sm:col-span-2">
                  <Field fieldKey="target_customers" label={isDigitalTechBusiness ? 'Target customer type' : 'Target audience'} required error={visibleError('target_customers')}>
                    <ToggleChips options={TARGET_AUDIENCE_OPTIONS} values={form.target_customers} onToggle={value => toggleArrayValue('target_customers', value)} />
                  </Field>
                </div>
                {isOnline && (
                  <Field fieldKey="ad_budget_monthly" label="Monthly ad budget" hint="Optional, but useful if this business depends heavily on digital acquisition.">
                    <CurrencyInput value={form.ad_budget_monthly} onChange={value => setField('ad_budget_monthly', value)} placeholder="2,000" />
                  </Field>
                )}
                <div className="sm:col-span-2">
                  <BooleanCard label="Will delivery or online ordering matter?" value={form.delivery_needed} onChange={value => setField('delivery_needed', value)} />
                </div>
              </div>
            </>
            )
          )}

          {step === 4 && (
            form.user_goal_mode === 'grow_existing' ? (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">What do they want next?</h2>
                <p className="text-sm text-slate-500">This strategic intent should heavily shape the final recommendation and whether digital or physical growth is better.</p>
              </div>
              <div className="space-y-5">
                <AuditCard title="Strategic goals" hint="Pick the decision outcomes the founder actually wants from this report.">
                  <div className="space-y-4">
                    <Field fieldKey="strategic_goals" label="Strategic decision goals" required error={visibleError('strategic_goals')}>
                      <ToggleChips options={STRATEGIC_GOAL_OPTIONS} values={form.strategic_goals} onToggle={value => toggleArrayValue('strategic_goals', value)} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field fieldKey="expansion_goal" label="Main growth goal" required error={visibleError('expansion_goal')}>
                        <Select options={EXPANSION_GOAL_OPTIONS} value={form.expansion_goal} onChange={value => setField('expansion_goal', value)} placeholder="Choose primary goal..." />
                      </Field>
                      <Field fieldKey="growth_strategy_type" label="Next strategic move" required error={visibleError('growth_strategy_type')}>
                        <Select options={GROWTH_STRATEGY_OPTIONS} value={form.growth_strategy_type} onChange={value => setField('growth_strategy_type', value)} placeholder="Choose next move..." />
                      </Field>
                    </div>
                  </div>
                </AuditCard>
                <ReportSummary form={form} />
              </div>
            </>
            ) : (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Launch budget & timeline</h2>
                <p className="text-sm text-slate-500">Set the commercial expectations now so the report can pressure-test budget realism, launch timing, and break-even confidence.</p>
              </div>

              {form.user_goal_mode === 'start_new' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field fieldKey="startup_budget" label="Startup budget" required error={visibleError('startup_budget')}>
                    <CurrencyInput value={form.startup_budget} onChange={value => setField('startup_budget', value)} placeholder="50,000" />
                  </Field>
                  <Field fieldKey="expected_revenue" label="Expected monthly revenue" required error={visibleError('expected_revenue')}>
                    <CurrencyInput value={form.expected_revenue} onChange={value => setField('expected_revenue', value)} placeholder="15,000" />
                  </Field>
                  <Field fieldKey="launch_timeline" label="Launch timeline" required error={visibleError('launch_timeline')}>
                    <Select options={LAUNCH_TIMELINE_OPTIONS} value={form.launch_timeline} onChange={value => setField('launch_timeline', value)} placeholder="Choose launch timing..." />
                  </Field>
                  <Field fieldKey="break_even_expectation" label="Break-even expectation" required error={visibleError('break_even_expectation')}>
                    <Select options={BREAK_EVEN_EXPECTATION_OPTIONS} value={form.break_even_expectation} onChange={value => setField('break_even_expectation', value)} placeholder="Choose expectation..." />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="First 90-day growth goal">
                      <input className="form-input" placeholder="Example: reach $20k/month, prove weekday lunch demand, and collect 50 Google reviews." value={form.growth_goal} onChange={e => setField('growth_goal', e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field fieldKey="risk_tolerance" label="Risk tolerance" required error={visibleError('risk_tolerance')}>
                      <RiskSelector value={form.risk_tolerance} onChange={value => setField('risk_tolerance', value)} />
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <AuditCard
                    title="Current business health"
                    hint="A founder-grade snapshot of how the current business actually operates. Repeat customers under 30% often indicates retention issues."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Current monthly revenue" required error={errors.current_monthly_revenue}>
                        <CurrencyInput value={form.current_monthly_revenue} onChange={value => setField('current_monthly_revenue', value)} placeholder="20,000" />
                      </Field>
                      <Field label="Target monthly revenue" required error={errors.target_monthly_revenue}>
                        <CurrencyInput value={form.target_monthly_revenue} onChange={value => setField('target_monthly_revenue', value)} placeholder="35,000" />
                      </Field>
                      <Field label="Business age">
                        <Select options={BUSINESS_AGE_OPTIONS} value={form.business_age_band} onChange={value => setField('business_age_band', value)} placeholder="Choose business age..." />
                      </Field>
                      <Field label="Current location suburb" required error={errors.current_location_suburb} hint="Use the suburb people already know you for.">
                        <input className="form-input" value={form.current_location_suburb} onChange={e => setField('current_location_suburb', e.target.value)} placeholder="Example: Glenelg" />
                      </Field>
                      <Field label="Premises" required error={errors.premises_type}>
                        <SegmentedControl options={PREMISES_TYPE_OPTIONS} value={form.premises_type} onChange={value => setField('premises_type', value as BusinessFormData['premises_type'])} />
                      </Field>
                      <Field label="Current team size">
                        <input className="form-input" type="number" min={1} value={form.current_team_size} onChange={e => setField('current_team_size', Math.max(1, Number(e.target.value) || 1))} />
                      </Field>
                      <Field label="Average daily customers" hint="If this is under expectations for your rent, traffic or conversion may be weak.">
                        <SliderField value={form.average_daily_customers} min={0} max={300} onChange={value => setField('average_daily_customers', value)} />
                      </Field>
                      <Field label="Repeat customer %" hint="Under 30% usually means loyalty, experience, or offer issues.">
                        <SliderField value={form.repeat_customer_rate} min={0} max={100} suffix="%" onChange={value => setField('repeat_customer_rate', value)} />
                      </Field>
                      <Field label="Average basket / order value" required error={errors.average_basket_value}>
                        <CurrencyInput value={form.average_basket_value} onChange={value => setField('average_basket_value', value)} placeholder="22" />
                      </Field>
                      <Field label="Average gross margin %" hint="A low margin can mean discounting, COGS pressure, or weak pricing perception.">
                        <SliderField value={form.average_gross_margin} min={5} max={90} suffix="%" onChange={value => setField('average_gross_margin', value)} />
                      </Field>
                      <Field label="Monthly fixed costs" required error={errors.monthly_fixed_costs}>
                        <CurrencyInput value={form.monthly_fixed_costs} onChange={value => setField('monthly_fixed_costs', value)} placeholder="18,000" />
                      </Field>
                      <Field label="Monthly staff costs" required error={errors.monthly_staff_costs}>
                        <CurrencyInput value={form.monthly_staff_costs} onChange={value => setField('monthly_staff_costs', value)} placeholder="12,000" />
                      </Field>
                      <Field label="Average Google rating" hint="Below 4.2 can materially reduce local conversion.">
                        <SegmentedControl options={['3.5', '4.0', '4.3', '4.6', '4.8+']} value={form.average_google_rating} onChange={value => setField('average_google_rating', value)} />
                      </Field>
                      <Field label="Google review count">
                        <input className="form-input" type="number" min={0} value={form.google_review_count} onChange={e => setField('google_review_count', Math.max(0, Number(e.target.value) || 0))} />
                      </Field>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Best-selling products / services">
                        <ToggleChips options={productPerformanceOptions} values={form.best_selling_products} onToggle={value => toggleArrayValue('best_selling_products', value)} />
                      </Field>
                      <Field label="Worst-performing products / services">
                        <ToggleChips options={productPerformanceOptions} values={form.worst_performing_products} onToggle={value => toggleArrayValue('worst_performing_products', value)} />
                      </Field>
                      {isDigitalOpsBusiness ? (
                        <>
                          <Field label="Best traffic channels" required error={errors.best_traffic_channels}>
                            <ToggleChips options={TRAFFIC_CHANNEL_OPTIONS} values={form.best_traffic_channels} onToggle={value => toggleArrayValue('best_traffic_channels', value)} />
                          </Field>
                          <Field label="Best converting offers" required error={errors.best_converting_offers}>
                            <ToggleChips options={CONVERTING_OFFER_OPTIONS} values={form.best_converting_offers} onToggle={value => toggleArrayValue('best_converting_offers', value)} />
                          </Field>
                          <Field label="Lead sources" required error={errors.lead_sources}>
                            <ToggleChips options={LEAD_SOURCE_OPTIONS} values={form.lead_sources} onToggle={value => toggleArrayValue('lead_sources', value)} />
                          </Field>
                          <Field label="Peak enquiry periods" required error={errors.peak_enquiry_periods}>
                            <ToggleChips options={PEAK_ENQUIRY_PERIOD_OPTIONS} values={form.peak_enquiry_periods} onToggle={value => toggleArrayValue('peak_enquiry_periods', value)} />
                          </Field>
                          <Field label="Strongest acquisition channels" required error={errors.strongest_acquisition_channels}>
                            <ToggleChips options={ACQUISITION_CHANNEL_OPTIONS} values={form.strongest_acquisition_channels} onToggle={value => toggleArrayValue('strongest_acquisition_channels', value)} />
                          </Field>
                        </>
                      ) : (
                        <>
                          <Field label="Busiest trading days" required error={errors.busiest_trading_days}>
                            <ToggleChips options={TRADING_DAY_OPTIONS} values={form.busiest_trading_days} onToggle={value => toggleArrayValue('busiest_trading_days', value)} />
                          </Field>
                          <Field label="Quietest trading days" required error={errors.quietest_trading_days}>
                            <ToggleChips options={TRADING_DAY_OPTIONS} values={form.quietest_trading_days} onToggle={value => toggleArrayValue('quietest_trading_days', value)} />
                          </Field>
                        </>
                      )}
                    </div>
                  </AuditCard>

                  <AuditCard
                    title="Growth bottlenecks"
                    hint="Choose the real bottlenecks. Weak reviews, low basket size, and opening-hour mismatch often create hidden revenue leakage."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Founder challenges" required error={errors.current_challenges}>
                          <ToggleChips options={DIGITAL_CHALLENGE_OPTIONS} values={form.current_challenges} onToggle={value => toggleArrayValue('current_challenges', value)} />
                        </Field>
                      </div>
                      <Field label="Current customer type" required error={errors.current_customer_type}>
                        <Select options={CURRENT_CUSTOMER_TYPE_OPTIONS} value={form.current_customer_type} onChange={value => setField('current_customer_type', value)} placeholder="Choose current mix..." />
                      </Field>
                      <Field label="Existing online presence" required error={errors.existing_online_presence}>
                        <Select options={ONLINE_PRESENCE_OPTIONS} value={form.existing_online_presence} onChange={value => setField('existing_online_presence', value)} placeholder="Choose online presence..." />
                      </Field>
                      <Field label="Social media channels" required error={errors.social_media_channels}>
                        <ToggleChips options={SOCIAL_MEDIA_CHANNEL_OPTIONS} values={form.social_media_channels} onToggle={value => toggleArrayValue('social_media_channels', value)} />
                      </Field>
                      <Field label="Website conversion quality" required error={errors.website_conversion_quality} hint="Poor conversion usually means wasted traffic and weak enquiry-to-sale performance.">
                        <SegmentedControl options={WEBSITE_CONVERSION_OPTIONS} value={form.website_conversion_quality} onChange={value => setField('website_conversion_quality', value)} />
                      </Field>
                      <Field label="Delivery / ordering platforms" required error={errors.delivery_platform_usage}>
                        <ToggleChips options={DELIVERY_PLATFORM_OPTIONS} values={form.delivery_platform_usage} onToggle={value => toggleArrayValue('delivery_platform_usage', value)} />
                      </Field>
                      <Field label="Supplier dependency risk" required error={errors.supplier_dependency_risk} hint="High dependency risk usually means margin and stock volatility.">
                        <SegmentedControl options={SUPPLIER_RISK_OPTIONS} value={form.supplier_dependency_risk} onChange={value => setField('supplier_dependency_risk', value)} />
                      </Field>
                    </div>
                  </AuditCard>

                  <AuditCard
                    title="Digital footprint"
                    hint="Add the channels customers actually use. We’ll estimate digital trust, SEO strength, and brand maturity from what you provide."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Website URL">
                        <input className="form-input" placeholder="https://yourbusiness.com.au" value={form.website_url} onChange={e => setField('website_url', e.target.value)} />
                      </Field>
                      <Field label="Google Business Profile URL">
                        <input className="form-input" placeholder="https://g.page/..." value={form.google_business_profile_url} onChange={e => setField('google_business_profile_url', e.target.value)} />
                      </Field>
                      <Field label="Instagram URL">
                        <input className="form-input" placeholder="https://instagram.com/yourbrand" value={form.instagram_url} onChange={e => setField('instagram_url', e.target.value)} />
                      </Field>
                      <Field label="Facebook page">
                        <input className="form-input" placeholder="https://facebook.com/yourbrand" value={form.facebook_url} onChange={e => setField('facebook_url', e.target.value)} />
                      </Field>
                      <Field label="TikTok page">
                        <input className="form-input" placeholder="https://tiktok.com/@yourbrand" value={form.tiktok_url} onChange={e => setField('tiktok_url', e.target.value)} />
                      </Field>
                      <Field label="LinkedIn page">
                        <input className="form-input" placeholder="https://linkedin.com/company/yourbrand" value={form.linkedin_url} onChange={e => setField('linkedin_url', e.target.value)} />
                      </Field>
                    </div>
                  </AuditCard>

                  <AuditCard
                    title="Performance metrics"
                    hint="This helps the report estimate digital maturity, retention risk, branch readiness, and customer lifetime value."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Average monthly website visitors">
                        <input className="form-input" type="number" min={0} value={form.average_monthly_website_visitors} onChange={e => setField('average_monthly_website_visitors', Math.max(0, Number(e.target.value) || 0))} />
                      </Field>
                      <Field label="Instagram followers">
                        <input className="form-input" type="number" min={0} value={form.instagram_followers} onChange={e => setField('instagram_followers', Math.max(0, Number(e.target.value) || 0))} />
                      </Field>
                      <Field label="Average post engagement %" hint="Strong brands often sustain 3-6%+ engagement.">
                        <SliderField value={form.average_post_engagement} min={0} max={20} suffix="%" onChange={value => setField('average_post_engagement', value)} />
                      </Field>
                      <Field label="Average weekly enquiries">
                        <SliderField value={form.average_weekly_enquiries} min={0} max={300} onChange={value => setField('average_weekly_enquiries', value)} />
                      </Field>
                      <Field label="Conversion rate %" hint="Low conversion usually points to offer, trust, or follow-up issues.">
                        <SliderField value={form.conversion_rate} min={0} max={100} suffix="%" onChange={value => setField('conversion_rate', value)} />
                      </Field>
                      <Field label="Delivery order %" hint="High delivery mix can signal margin drag if unit economics are weak.">
                        <SliderField value={form.delivery_order_percentage} min={0} max={100} suffix="%" onChange={value => setField('delivery_order_percentage', value)} />
                      </Field>
                      <Field label="Walk-in %" hint="Useful for judging dependence on local foot traffic.">
                        <SliderField value={form.walk_in_percentage} min={0} max={100} suffix="%" onChange={value => setField('walk_in_percentage', value)} />
                      </Field>
                      <Field label="Customer lifetime estimate">
                        <CurrencyInput value={form.customer_lifetime_estimate} onChange={value => setField('customer_lifetime_estimate', value)} placeholder="450" />
                      </Field>
                    </div>
                  </AuditCard>

                  <AuditCard
                    title="Expansion strategy"
                    hint="This tells the report whether you should fix the current site first, widen delivery, or look at a second suburb."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Expansion goal" required error={errors.expansion_goal}>
                        <Select options={EXPANSION_GOAL_OPTIONS} value={form.expansion_goal} onChange={value => setField('expansion_goal', value)} placeholder="Choose growth goal..." />
                      </Field>
                      <Field label="What type of growth are you considering?" required error={errors.growth_strategy_type}>
                        <Select options={GROWTH_STRATEGY_OPTIONS} value={form.growth_strategy_type} onChange={value => setField('growth_strategy_type', value)} placeholder="Choose strategy..." />
                      </Field>
                      <BooleanCard label="Second suburb mode?" value={form.new_suburb_expansion || form.growth_strategy_type === 'Open second suburb'} onChange={value => setField('new_suburb_expansion', value)} />
                      <BooleanCard label="Delivery radius expansion?" value={form.delivery_expansion || form.growth_strategy_type === 'Expand delivery radius'} onChange={value => setField('delivery_expansion', value)} />
                    </div>
                    {(form.new_suburb_expansion || form.growth_strategy_type === 'Open second suburb') && (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-600">
                        The report will now prioritise second-suburb recommendations based on local competition, business density, and operational fit.
                      </div>
                    )}
                  </AuditCard>
                </div>
              )}

              <ReportSummary form={form} />
            </>
            )
          )}

          {step === 5 && (
            <>
              <div>
                <h2 className="mb-1 text-2xl font-display font-bold text-slate-900">Real competitor scan</h2>
                <p className="text-sm text-slate-500">
                  The final report will use real Google Maps competitor data, competitor density, weak operators, and nearby retail or food clusters when available.
                </p>
              </div>
              <div className="ui-section">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="ui-info-box">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Radius</div>
                    <div className="mt-1 text-sm text-slate-900">{form.radius_km}km real competitor scan</div>
                  </div>
                  <div className="ui-info-box">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Target area</div>
                    <div className="mt-1 text-sm text-slate-900">{form.suburb || form.target_market || form.current_location_suburb || form.state || 'Australia'}</div>
                  </div>
                  <div className="ui-info-box">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{isDigitalTechBusiness ? 'Market context' : 'Demand zone'}</div>
                    <div className="mt-1 text-sm text-slate-900">{isDigitalTechBusiness ? (form.target_market || 'Australian online market') : (form.demand_zone_type || 'Mixed catchment')}</div>
                  </div>
                  <div className="ui-info-box">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{isDigitalTechBusiness ? 'Competition lens' : 'Anchors nearby'}</div>
                    <div className="mt-1 text-sm text-slate-900">{isDigitalTechBusiness ? 'Local substitutes + broader online competitors' : (form.anchor_locations.slice(0, 2).join(', ') || 'General local traffic')}</div>
                  </div>
                </div>
              </div>
              <ReportSummary form={form} />
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/92 backdrop-blur-sm">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-7 w-7 animate-pulse rounded-full bg-brand-500/20" />
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 font-display text-lg font-bold text-slate-900">{LOADING_STAGES[loadingStage].label}</div>
            <div className="text-sm text-slate-500">{LOADING_STAGES[loadingStage].sub}</div>
          </div>
          <div className="flex max-w-xs flex-wrap justify-center gap-1.5">
            {['Market', 'Competitors', 'Scoring', 'Roadmap'].map((label, index) => (
              <div
                key={label}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  index <= loadingStage ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pb-28">
        <StepNavigation
          step={step}
          totalSteps={totalSteps}
          labels={stepLabels}
          loading={loading}
          disabled={!currentStepValid}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
