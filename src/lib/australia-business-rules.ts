import type { BusinessFormData, SetupChecklistSection } from '@/types'

export const USER_GOAL_OPTIONS = [
  { value: 'start_new', label: 'Start a new business', description: 'Validate demand, budget, suburb fit, and launch timing before you invest.' },
  { value: 'grow_existing', label: 'Grow or improve an existing business', description: 'Diagnose what is limiting growth and find practical expansion moves in Australia.' },
] as const

export const BUSINESS_TYPES = [
  'Café / Coffee shop',
  'Restaurant',
  'Food truck',
  'Takeaway / Fast food',
  'Bakery',
  'Grocery / Supermarket',
  'Convenience store',
  'Barber / Beauty salon',
  'Pharmacy',
  'Clothing retail',
  'Fitness / Gym',
  'Childcare',
  'Cleaning services',
  'IT / Tech services',
  'Consulting',
  'SaaS',
  'Online course',
  'Digital agency',
  'Marketplace',
  'App',
  'E-commerce store',
  'Mobile service business',
  'Other',
] as const

export const COMMUNITY_TYPES = [
  'CBD / office district',
  'Inner-city mixed',
  'Suburban families',
  'Beachside / lifestyle',
  'Student precinct',
  'Tourist hotspot',
  'Regional town centre',
  'Industrial / trade area',
  'High-income retail strip',
  'Mixed local catchment',
] as const

export const DEMAND_ZONE_OPTIONS = [
  'School zone',
  'Office zone',
  'Tourist zone',
  'Residential family zone',
  'Retail strip',
  'Mixed catchment',
] as const

export const DELIVERY_ZONE_IMPORTANCE_OPTIONS = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const

export const ANCHOR_LOCATION_OPTIONS = [
  'Shopping centre',
  'Train station',
  'School',
  'University',
  'Hospital',
  'Office cluster',
  'Beach / foreshore',
  'Market / event space',
  'Main road retail strip',
  'Supermarket anchor',
] as const

export const TARGET_AUDIENCE_OPTIONS = [
  'Families',
  'Students',
  'Young professionals',
  'Office workers',
  'Tourists',
  'Local residents',
  'Seniors',
  'High-income shoppers',
  'Budget-conscious shoppers',
  'Small businesses',
  'Mixed audience',
] as const

export const PRICE_RANGE_OPTIONS = [
  'Under $10',
  '$10–$30',
  '$30–$60',
  '$60–$100',
  '$100–$250',
  '$250–$500',
  '$500–$1,000',
  '$1,000–$5,000',
  '$5,000+',
  'Subscription',
  'Custom quote',
] as const

export const LAUNCH_TIMELINE_OPTIONS = [
  'Within 1 month',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  '12+ months',
  'Just exploring',
] as const

export const DELIVERY_COVERAGE_OPTIONS = [
  'SA only',
  'Statewide',
  'Metro only',
  'Australia-wide',
  'Capital cities only',
  'Selected suburbs only',
  'Custom coverage',
] as const

export const TARGET_MARKET_OPTIONS = [
  'Adelaide metro',
  'South Australia',
  'Melbourne metro',
  'Victoria',
  'Sydney metro',
  'New South Wales',
  'Brisbane metro',
  'Queensland',
  'Perth metro',
  'Western Australia',
  'Australia-wide',
] as const

export const CURRENT_CHALLENGE_OPTIONS = [
  'Low foot traffic',
  'Weak Google reviews',
  'Poor local SEO',
  'Weak repeat customer rate',
  'Low average order value',
  'Overstaffing',
  'Understaffing',
  'Supplier costs too high',
  'Too much discounting',
  'Wrong pricing perception',
  'Poor conversion from enquiries',
  'Delivery margins too thin',
  'Poor suburb positioning',
  'Weak branding',
  'Low retention',
  'Competitor stealing market share',
  'Bad opening hours',
  'Weak online ordering funnel',
] as const

export const CURRENT_CUSTOMER_TYPE_OPTIONS = [
  'Mostly locals',
  'Mostly office workers',
  'Mostly families',
  'Mostly students',
  'Mostly tourists',
  'Mixed customer base',
] as const

export const ONLINE_PRESENCE_OPTIONS = [
  'None yet',
  'Basic website only',
  'Google Business Profile only',
  'Socials but inconsistent',
  'Strong website + SEO',
  'Strong website + ads + socials',
] as const

export const EXPANSION_GOAL_OPTIONS = [
  'Increase sales at current location',
  'Lift margins / pricing',
  'Improve customer retention',
  'Add delivery / online sales',
  'Open in another suburb',
  'Serve a wider Australian market',
] as const

export const STRATEGIC_GOAL_OPTIONS = [
  'Fix current business',
  'Improve repeat customers',
  'Beat competitors',
  'Improve online visibility',
  'Open second location',
  'Expand delivery',
  'Improve pricing',
  'Test new products',
  'Suburb demand research',
  'Research only',
] as const

export const GROWTH_STRATEGY_OPTIONS = [
  'Improve current location',
  'Improve pricing',
  'Improve retention',
  'Increase local awareness',
  'Expand delivery radius',
  'Open second suburb',
  'Franchise model',
  'Online sales',
  'B2B / wholesale',
  'New product line',
] as const

export const PREMISES_TYPE_OPTIONS = ['leased', 'owned'] as const
export const WEBSITE_CONVERSION_OPTIONS = ['Poor', 'Basic', 'Average', 'Strong', 'Excellent'] as const
export const SUPPLIER_RISK_OPTIONS = ['Low', 'Medium', 'High'] as const
export const SOCIAL_MEDIA_CHANNEL_OPTIONS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'X', 'None'] as const
export const DELIVERY_PLATFORM_OPTIONS = ['Uber Eats', 'DoorDash', 'Menulog', 'Own delivery', 'Click and collect', 'No delivery'] as const
export const TRADING_DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export const BUSINESS_AGE_OPTIONS = ['Less than 6 months', '6-12 months', '1-2 years', '3-5 years', '5+ years'] as const
export const AGE_GROUP_OPTIONS = ['Under 18', '18–25', '25–35', '35–50', '50+', 'All ages'] as const
export const AUDIENCE_TYPE_OPTIONS = ['Local residents', 'Office workers', 'Students', 'Tourists', 'Mixed audience', 'Digital-first customers', 'Families', 'Small businesses'] as const
export const LUNCH_DINNER_DEMAND_OPTIONS = ['Breakfast-heavy', 'Lunch-heavy', 'Dinner-heavy', 'All-day demand', 'Not time-sensitive'] as const
export const WEEKEND_TRAFFIC_OPTIONS = ['Low', 'Moderate', 'High', 'Very high'] as const
export const IMPORTANCE_OPTIONS = ['Low', 'Moderate', 'High', 'Critical'] as const
export const FOOT_TRAFFIC_OPTIONS = ['Low', 'Moderate', 'High', 'Very high'] as const
export const SUPPLY_MODEL_OPTIONS = ['Direct suppliers', 'Wholesalers', 'Local producers', 'Dropship / made to order', 'Digital delivery only', 'Mixed supply model'] as const
export const INVENTORY_ASSUMPTION_OPTIONS = ['Lean launch inventory', 'Standard launch inventory', 'High-volume opening stock', 'Made to order / minimal stock', 'Service business / no inventory'] as const
export const BREAK_EVEN_EXPECTATION_OPTIONS = ['Under 3 months', '3-6 months', '6-12 months', '12-18 months', '18+ months', 'Not sure yet'] as const
export const DIGITAL_CHALLENGE_OPTIONS = [
  'Low repeat customers',
  'Weak social media',
  'Low foot traffic',
  'High rent',
  'Staff shortage',
  'Weak conversion',
  'Menu/pricing problem',
  'Poor delivery reach',
  'Unclear branding',
  'No SEO',
  'Low Google reviews',
  'No upselling',
  'Customer churn',
  'Considering second branch',
] as const
export const TRAFFIC_CHANNEL_OPTIONS = ['Organic search', 'Google Maps', 'Instagram', 'Facebook', 'TikTok', 'Referrals', 'Email', 'Paid ads'] as const
export const CONVERTING_OFFER_OPTIONS = ['Entry offer', 'Bundle', 'Subscription', 'Consultation', 'Premium package', 'Seasonal special', 'Trial / demo'] as const
export const LEAD_SOURCE_OPTIONS = ['Google search', 'Google Maps', 'Instagram DMs', 'Website forms', 'Phone calls', 'Referrals', 'Email enquiries', 'Marketplace leads'] as const
export const PEAK_ENQUIRY_PERIOD_OPTIONS = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekends', 'End of month', 'School holidays'] as const
export const ACQUISITION_CHANNEL_OPTIONS = ['SEO', 'Google Ads', 'Instagram content', 'TikTok content', 'Email', 'Referrals', 'Partnerships', 'Outbound sales'] as const

export const AUSTRALIA_SETUP_RULES: Record<string, SetupChecklistSection[]> = {
  'Food truck': [
    {
      title: 'Australian setup & permits checklist',
      items: [
        'Register an ABN and your business name before trading.',
        'Confirm council mobile food vendor permits for each area you plan to trade in.',
        'Complete food business registration and appoint a food safety supervisor if required.',
        'Arrange public liability insurance and vehicle / equipment cover.',
        'Pass vehicle fit-out, gas, and fire safety checks before launch.',
      ],
    },
  ],
  'Grocery / Supermarket': [
    {
      title: 'Australian setup & permits checklist',
      items: [
        'Register an ABN and secure the business name.',
        'Check council zoning, lease suitability, and signage conditions.',
        'Set up supplier accounts, refrigeration, and compliant food storage processes.',
        'Document packaged goods, food handling, and waste management requirements.',
        'Arrange public liability and stock / contents insurance.',
      ],
    },
  ],
  'Barber / Beauty salon': [
    {
      title: 'Australian setup & permits checklist',
      items: [
        'Register an ABN and business name before opening.',
        'Confirm council approval or fit-out consent for the premises if needed.',
        'Implement hygiene, infection control, linen, and sharps / waste procedures.',
        'Check whether any services require additional licensing or practitioner registration.',
        'Arrange public liability and professional indemnity insurance.',
      ],
    },
  ],
}

const DEFAULT_SETUP_RULES: SetupChecklistSection[] = [
  {
    title: 'Australian setup & permits checklist',
    items: [
      'Register an ABN and business name before launch.',
      'Check council zoning, premises suitability, and signage rules.',
      'Confirm lease, insurance, and fit-out requirements before committing capital.',
      'Review any industry-specific hygiene, safety, or staff compliance obligations.',
      'Set up GST, payroll, supplier terms, and record-keeping from day one.',
    ],
  },
]

export function getEffectiveBusinessType(form: Pick<BusinessFormData, 'business_type' | 'business_type_other'>): string {
  return form.business_type === 'Other' && form.business_type_other.trim()
    ? form.business_type_other.trim()
    : form.business_type
}

export function getAustraliaSetupChecklist(form: Pick<BusinessFormData, 'business_type' | 'business_type_other'>): SetupChecklistSection[] {
  const businessType = getEffectiveBusinessType(form)
  return AUSTRALIA_SETUP_RULES[businessType] ?? DEFAULT_SETUP_RULES
}

export function isDigitalOperationsBusiness(form: Pick<BusinessFormData, 'business_model_type' | 'business_type' | 'business_type_other'>): boolean {
  const businessType = getEffectiveBusinessType(form)
  return (
    form.business_model_type === 'online' ||
    /saas|online course|digital agency|marketplace|consulting|app|it \/ tech services|e-commerce/i.test(businessType)
  )
}

const PRODUCT_OPTION_LIBRARY: Array<{ pattern: RegExp; options: string[] }> = [
  { pattern: /saas|software|app/i, options: ['Starter plan', 'Pro plan', 'Enterprise', 'Add-ons', 'Onboarding package', 'Annual plan'] },
  { pattern: /online course|course|training|education|university|academy/i, options: ['Beginner course', 'Advanced course', 'Certification', 'Workshops', 'Mentorship', 'Online units'] },
  { pattern: /digital agency|marketing agency|creative/i, options: ['SEO retainer', 'Paid ads management', 'Content package', 'Website project', 'Audit', 'Strategy session'] },
  { pattern: /consulting|advisor|advisory/i, options: ['Strategy session', 'Retainer', 'Audit', 'Implementation sprint', 'Workshop', 'Premium advisory'] },
  { pattern: /bakery|café|cafe|coffee/i, options: ['Coffee', 'Breakfast', 'Lunch', 'Pastries', 'Cakes', 'Retail add-ons'] },
  { pattern: /restaurant|takeaway|food truck|fast food/i, options: ['Signature item', 'Combo meal', 'Lunch special', 'Dinner service', 'Family bundle', 'Delivery menu'] },
  { pattern: /grocery|supermarket|convenience/i, options: ['Core staples', 'Fresh produce', 'Grab-and-go', 'Premium imports', 'Household essentials', 'Seasonal specials'] },
  { pattern: /barber|beauty|salon/i, options: ['Core service', 'Premium package', 'Add-on service', 'Membership', 'Retail products', 'Packages'] },
]

function extractServiceTokens(productsServices: string): string[] {
  return productsServices
    .split(/[,\n/]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6)
}

export function getDynamicProductServiceOptions(form: Pick<BusinessFormData, 'business_type' | 'business_type_other' | 'products_services' | 'business_model_type' | 'user_goal_mode'>): string[] {
  const businessType = getEffectiveBusinessType(form)
  const baseOptions = PRODUCT_OPTION_LIBRARY.find(entry => entry.pattern.test(`${businessType} ${form.products_services}`))?.options ?? ['Core offer', 'Premium option', 'Entry offer', 'Add-on', 'Bundle', 'Signature service']
  const typedOptions = extractServiceTokens(form.products_services)
  const modeOptions = form.user_goal_mode === 'grow_existing'
    ? ['Highest-margin offer', 'Repeat-purchase offer', 'Upsell item']
    : ['Launch hero offer', 'Early customer offer', 'Founding package']
  const modelOptions = form.business_model_type === 'online'
    ? ['Subscription', 'Lead magnet', 'Digital bundle']
    : form.business_model_type === 'hybrid'
    ? ['In-store exclusive', 'Online-only offer', 'Cross-channel bundle']
    : ['Walk-in favourite', 'Premium upsell', 'Local special']

  return [...new Set([...typedOptions, ...baseOptions, ...modeOptions, ...modelOptions])].slice(0, 10)
}
