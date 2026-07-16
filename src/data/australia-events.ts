// ─────────────────────────────────────────────────────────────────────────────
// Australian Business Events — curated dataset of major recurring events.
// Update cadence: monthly review. All events are real, recurring fixtures on
// the Australian business calendar; dates point to the event's official site
// since exact dates shift year to year.
// ─────────────────────────────────────────────────────────────────────────────

export type EventCategory =
  | 'Networking'
  | 'Trade show'
  | 'Food & Beverage'
  | 'Tech conference'
  | 'Retail expo'
  | 'Startup'
  | 'Franchise'
  | 'Small business'

export interface BusinessEvent {
  name: string
  category: EventCategory
  location: string
  state: string
  timing: string // typical time of year
  description: string
  url: string
}

export const AUSTRALIAN_BUSINESS_EVENTS: BusinessEvent[] = [
  {
    name: 'Fine Food Australia',
    category: 'Food & Beverage',
    location: 'Sydney / Melbourne (alternates)',
    state: 'NSW / VIC',
    timing: 'September',
    description: 'The largest food industry trade event in Australia — suppliers, equipment, hospitality tech, and new product launches.',
    url: 'https://finefoodaustralia.com.au',
  },
  {
    name: 'Foodservice Australia',
    category: 'Food & Beverage',
    location: 'Melbourne Convention Centre',
    state: 'VIC',
    timing: 'May–June',
    description: 'Food service and hospitality expo covering cafés, restaurants, catering, and food trucks. Includes the Café School and Chef of the Year.',
    url: 'https://foodserviceaustralia.com.au',
  },
  {
    name: 'Melbourne Food & Wine Festival',
    category: 'Food & Beverage',
    location: 'Melbourne',
    state: 'VIC',
    timing: 'March',
    description: 'Major consumer food festival — a key marketing and brand-launch window for hospitality businesses.',
    url: 'https://melbournefoodandwine.com.au',
  },
  {
    name: 'Tech Leaders / SXSW Sydney',
    category: 'Tech conference',
    location: 'Sydney',
    state: 'NSW',
    timing: 'October',
    description: 'SXSW\'s Asia-Pacific edition — tech, startups, creative industries, and media. Strong founder networking.',
    url: 'https://sxswsydney.com',
  },
  {
    name: 'CeBIT-style GITEX / Tech in Gov',
    category: 'Tech conference',
    location: 'Canberra',
    state: 'ACT',
    timing: 'August',
    description: 'Government-focused technology expo — relevant for IT businesses selling into the public sector.',
    url: 'https://techingov.com.au',
  },
  {
    name: 'Online Retailer Conference & Expo',
    category: 'Retail expo',
    location: 'ICC Sydney',
    state: 'NSW',
    timing: 'July',
    description: 'Australia\'s biggest e-commerce event — online retail, marketplaces, logistics, and D2C brands.',
    url: 'https://www.onlineretailer.com',
  },
  {
    name: 'Melbourne Fashion Festival — Business Program',
    category: 'Retail expo',
    location: 'Melbourne',
    state: 'VIC',
    timing: 'March',
    description: 'Fashion and clothing industry showcase with dedicated business and wholesale programs for labels and boutiques.',
    url: 'https://melbournefashionfestival.com.au',
  },
  {
    name: 'Reed Gift Fairs',
    category: 'Retail expo',
    location: 'Sydney / Melbourne',
    state: 'NSW / VIC',
    timing: 'February & August',
    description: 'Wholesale buying fair for giftware, homewares, and retail products — where retailers source stock.',
    url: 'https://www.reedgiftfairs.com.au',
  },
  {
    name: 'StartCon / Startup Grind Australia chapters',
    category: 'Startup',
    location: 'Sydney, Melbourne, Brisbane (monthly)',
    state: 'National',
    timing: 'Monthly meetups',
    description: 'Recurring founder meetups and pitch nights across major cities — the fastest way into local startup networks.',
    url: 'https://www.startupgrind.com',
  },
  {
    name: 'Myriad Festival',
    category: 'Startup',
    location: 'Brisbane',
    state: 'QLD',
    timing: 'May',
    description: 'Queensland\'s flagship innovation and startup festival, connecting founders with investors and corporates.',
    url: 'https://myriad.live',
  },
  {
    name: 'Small Business Expo (Business Expos Australia)',
    category: 'Small business',
    location: 'Brisbane, Gold Coast, Sydney, Melbourne',
    state: 'National',
    timing: 'Multiple dates year-round',
    description: 'Free expos for small business owners — marketing, finance, franchising, and government support all under one roof.',
    url: 'https://businessexpos.com.au',
  },
  {
    name: 'Franchising & Business Opportunities Expo',
    category: 'Franchise',
    location: 'Sydney, Melbourne, Brisbane, Perth',
    state: 'National',
    timing: 'March–October (rotating)',
    description: 'Meet franchise systems seeking operators — useful both for buying a franchise and benchmarking competitors.',
    url: 'https://franchisingexpo.com.au',
  },
  {
    name: 'AIIA & state chamber networking nights',
    category: 'Networking',
    location: 'All capital cities',
    state: 'National',
    timing: 'Monthly',
    description: 'State chambers of commerce run regular local networking events — the cheapest high-value marketing a local business can do.',
    url: 'https://www.australianchamber.com.au',
  },
  {
    name: 'Sydney Build Expo',
    category: 'Trade show',
    location: 'ICC Sydney',
    state: 'NSW',
    timing: 'May',
    description: 'Construction and building trade show — for trades businesses, suppliers, and construction-adjacent services.',
    url: 'https://www.sydneybuildexpo.com',
  },
  {
    name: 'Fitness & Health Expo (AusFitness)',
    category: 'Trade show',
    location: 'Sydney / Melbourne',
    state: 'NSW / VIC',
    timing: 'April–May',
    description: 'Fitness industry trade event — gym owners, PTs, wellness brands, and equipment suppliers.',
    url: 'https://fitnessshow.com.au',
  },
  {
    name: 'Naturally Good Expo',
    category: 'Trade show',
    location: 'ICC Sydney',
    state: 'NSW',
    timing: 'June',
    description: 'Health, organic, and natural products trade show — key sourcing event for wellness retailers and cafés.',
    url: 'https://naturallygood.com.au',
  },
]

export const EVENT_CATEGORIES: EventCategory[] = [
  'Networking',
  'Trade show',
  'Food & Beverage',
  'Tech conference',
  'Retail expo',
  'Startup',
  'Franchise',
  'Small business',
]
