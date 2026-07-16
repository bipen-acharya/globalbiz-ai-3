// ─────────────────────────────────────────────────────────────────────────────
// Market Intelligence — curated Australian business data.
//
// Sources: ABS "Counts of Australian Businesses" (8165.0) — business counts,
// entry/exit and survival rates by industry; state small-business commissions.
// Figures are rounded, representative values from the most recent ABS release.
// Update cadence: quarterly manual review.
// ─────────────────────────────────────────────────────────────────────────────

export interface StateProfile {
  state: string
  abbrev: string
  topIndustries: string[]
  fastestGrowing: string
  note: string
}

export interface SurvivalRate {
  industry: string
  year1: number // % surviving 1 year
  year4: number // % surviving 4 years
  outlook: 'strong' | 'stable' | 'challenged'
}

export interface RiskRewardProfile {
  industry: string
  risk: 'High' | 'Medium' | 'Low'
  rewardPotential: 'High' | 'Medium' | 'Low'
  note: string
}

// ── Popular business types by state ──────────────────────────────────────────

export const STATE_PROFILES: StateProfile[] = [
  {
    state: 'New South Wales',
    abbrev: 'NSW',
    topIndustries: ['Professional services', 'Construction', 'Hospitality', 'Financial services'],
    fastestGrowing: 'Health care & social assistance',
    note: 'Australia\'s largest business market. Sydney CBD saturation pushes opportunity to Western Sydney growth corridors (Parramatta, Liverpool, Penrith).',
  },
  {
    state: 'Victoria',
    abbrev: 'VIC',
    topIndustries: ['Professional services', 'Hospitality', 'Retail', 'Construction'],
    fastestGrowing: 'Health care & social assistance',
    note: 'Melbourne has Australia\'s densest café/restaurant market — strong food culture but fierce hospitality competition. Regional VIC (Geelong, Ballarat) is growing fast.',
  },
  {
    state: 'Queensland',
    abbrev: 'QLD',
    topIndustries: ['Construction', 'Trades', 'Tourism & hospitality', 'Transport'],
    fastestGrowing: 'Construction & trades',
    note: 'Population inflow from southern states is driving trades, housing, and services demand — especially SE QLD (Gold Coast, Sunshine Coast, Logan).',
  },
  {
    state: 'Western Australia',
    abbrev: 'WA',
    topIndustries: ['Mining services', 'Construction', 'Trades', 'Transport'],
    fastestGrowing: 'Mining & resources services',
    note: 'Resource-cycle economy. Perth service businesses benefit from high average incomes; regional WA has thin competition but thin demand.',
  },
  {
    state: 'South Australia',
    abbrev: 'SA',
    topIndustries: ['Agriculture', 'Manufacturing', 'Health care', 'Wine & food'],
    fastestGrowing: 'Health care & defence industry',
    note: 'Adelaide\'s defence and space sector build-up is creating B2B opportunities. Lower rents make it a good testing ground for retail concepts.',
  },
  {
    state: 'Tasmania',
    abbrev: 'TAS',
    topIndustries: ['Agriculture', 'Tourism', 'Food production', 'Aquaculture'],
    fastestGrowing: 'Tourism & premium food',
    note: 'Small market with strong premium/artisan branding power — Tasmanian provenance carries a price premium nationally.',
  },
  {
    state: 'Australian Capital Territory',
    abbrev: 'ACT',
    topIndustries: ['Professional services', 'Government contracting', 'IT services', 'Hospitality'],
    fastestGrowing: 'IT & cyber security services',
    note: 'Highest average household income in Australia. Government procurement is the anchor customer for B2B services.',
  },
  {
    state: 'Northern Territory',
    abbrev: 'NT',
    topIndustries: ['Construction', 'Government services', 'Tourism', 'Transport'],
    fastestGrowing: 'Defence-adjacent services',
    note: 'Thin competition in nearly every category — but small population means demand ceilings arrive quickly.',
  },
]

// ── Survival rates by industry (ABS 4-year survival, representative) ─────────

export const SURVIVAL_RATES: SurvivalRate[] = [
  { industry: 'Health care & social assistance', year1: 88, year4: 68, outlook: 'strong' },
  { industry: 'Professional & technical services', year1: 85, year4: 62, outlook: 'strong' },
  { industry: 'Education & training', year1: 84, year4: 60, outlook: 'strong' },
  { industry: 'Financial & insurance services', year1: 84, year4: 61, outlook: 'stable' },
  { industry: 'Rental & real estate services', year1: 83, year4: 59, outlook: 'stable' },
  { industry: 'Agriculture, forestry & fishing', year1: 86, year4: 65, outlook: 'stable' },
  { industry: 'Manufacturing', year1: 82, year4: 57, outlook: 'stable' },
  { industry: 'Construction & trades', year1: 80, year4: 54, outlook: 'stable' },
  { industry: 'Retail trade', year1: 78, year4: 50, outlook: 'challenged' },
  { industry: 'Transport & logistics', year1: 76, year4: 48, outlook: 'stable' },
  { industry: 'Accommodation & food services', year1: 74, year4: 45, outlook: 'challenged' },
  { industry: 'Administrative & support services', year1: 75, year4: 46, outlook: 'stable' },
]

// ── High risk / high reward ───────────────────────────────────────────────────

export const RISK_REWARD: RiskRewardProfile[] = [
  {
    industry: 'Restaurants & cafés',
    risk: 'High',
    rewardPotential: 'High',
    note: 'Lowest survival rates of any major category, but successful venues earn strong margins and expand into groups. Location and differentiation decide everything.',
  },
  {
    industry: 'E-commerce / D2C brands',
    risk: 'High',
    rewardPotential: 'High',
    note: 'Low startup cost but brutal customer-acquisition economics. Winners scale nationally without premises overhead.',
  },
  {
    industry: 'Specialised trades (electrical, plumbing)',
    risk: 'Low',
    rewardPotential: 'High',
    note: 'Licensing creates a competition moat. Demand outstrips supply in growth corridors. The constraint is labour, not customers.',
  },
  {
    industry: 'Allied health (physio, psychology, NDIS)',
    risk: 'Low',
    rewardPotential: 'Medium',
    note: 'Strong demand tailwinds and funding support. Regulated entry keeps saturation low. Slower to scale beyond the founder\'s own hours.',
  },
  {
    industry: 'Fitness studios & gyms',
    risk: 'Medium',
    rewardPotential: 'Medium',
    note: 'Franchise saturation in metro areas; boutique and niche formats (reformer pilates, strength-only) still finding whitespace.',
  },
  {
    industry: 'IT & cyber security consulting',
    risk: 'Medium',
    rewardPotential: 'High',
    note: 'High demand, high rates, low capital requirements — but winning the first contracts without a track record is the hard part.',
  },
]

// ── Trend lists ───────────────────────────────────────────────────────────────

export const GROWING_INDUSTRIES: string[] = [
  'Health care, NDIS & aged-care services',
  'Cyber security & IT services',
  'Renewable energy installation & electrification trades',
  'Specialty food & beverage (premium, dietary-specific)',
  'Pet services & pet care',
  'Home services & maintenance (ageing housing stock)',
  'Online education & professional training',
]

export const DECLINING_INDUSTRIES: string[] = [
  'Print media & traditional publishing',
  'Video/DVD and physical media retail',
  'Traditional travel agencies (storefront)',
  'Fax/landline-era office services',
  'Cheque-based financial services',
  'Generic mid-market fashion retail (squeezed by fast fashion + online)',
]

export const DATA_SOURCE_NOTE =
  'Derived from ABS Counts of Australian Businesses (cat. 8165.0) and state small business commission reports. Figures are rounded representative values, reviewed quarterly. Treat as directional context, not investment advice.'
