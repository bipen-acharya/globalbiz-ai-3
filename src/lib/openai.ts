import OpenAI from 'openai'
import type { BusinessFormData, AnalysisResult, NearbyCompetitorData, CompetitorThreat, Recommendation, RoadmapWeek, AlternativeLocation } from '@/types'
import type { ScoringOutput } from './scoring-engine'
import { priceLevelLabel } from './utils'
import { getAustraliaSetupChecklist, getEffectiveBusinessType } from './australia-business-rules'
import { getBusinessGroup, getBusinessGroupLabel, isDigitalTechGroup } from './business-groups'

function getClient(): OpenAI {
  const k = process.env.OPENAI_API_KEY
  if (!k) throw new Error('OPENAI_API_KEY not set')
  return new OpenAI({ apiKey: k })
}

// ── Signal-driven text content (no static strings) ───────────────────────────
function buildSignalDrivenContent(
  data: BusinessFormData,
  nearby: NearbyCompetitorData | null,
  scores: ScoringOutput
): {
  summary: string
  why_succeed: string[]
  why_fail: string[]
  missing_elements: string[]
  opportunity_highlights: string[]
  competitor_threats: CompetitorThreat[]
  why_competitors_succeed: string[]
  best_differentiation: string[]
  best_underserved_niche: string
  suggestions: string[]
} {
  const s = scores.signals
  const businessType = getEffectiveBusinessType(data)
  const businessGroup = getBusinessGroup(data)
  const ageFocus = data.target_age_groups.join(', ') || '25–40'
  const audienceFocus = data.audience_types.join(', ') || 'mixed audience'
  const loc = [data.suburb || data.target_market || data.state, data.state].filter(Boolean).join(', ')
  const competitors = nearby?.competitors ?? []
  const count = s.competitor_count

  // ── Summary — composed from real numbers ──────────────────────────────────
  const densityWord = { low: 'low', medium: 'moderate', high: 'high', saturated: 'saturated' }[s.saturation_label]
  const scoreWord = scores.success_score >= 75 ? 'strong' : scores.success_score >= 60 ? 'moderate' : scores.success_score >= 45 ? 'challenging' : 'high-risk'
  const priceLine = s.price_gap === 'below_market'
    ? `Your pricing is below the local market average (${priceLevelLabel(nearby?.avg_price_level ?? null)}), creating an entry-price advantage.`
    : s.price_gap === 'above_market'
    ? `Your pricing sits above the local average — expect to justify the premium with quality.`
    : `Your pricing aligns with the local market average.`

  const modeSummary = data.user_goal_mode === 'grow_existing'
    ? `This report focuses on what is limiting growth, which nearby or digital competitors are winning, and where expansion could improve revenue.`
    : `This report focuses on launch feasibility, local demand, and how quickly the business could reach break-even.`
  const scheduleLine = s.busiest_trading_window && !isDigitalTechGroup(businessGroup)
    ? `The current setup leans toward ${s.busiest_trading_window.toLowerCase()} trading.`
    : isDigitalTechGroup(businessGroup)
    ? 'Online acquisition, positioning, and trust matter more here than walk-by demand.'
    : ''
  const summary = `A ${businessType} in ${loc} has ${scoreWord} feasibility. ${count} similar businesses operate within ${data.radius_km}km, indicating ${densityWord} competition density (${s.density_per_sqkm.toFixed(1)}/km²). ${priceLine} ${scheduleLine} ${modeSummary}`.trim()

  // ── Why succeed — real signals ─────────────────────────────────────────────
  const whySucceed: string[] = []
  if (count < 4) whySucceed.push(`Only ${count} direct competitors within ${data.radius_km}km — low saturation for ${businessType}`)
  else if (s.weak_competitors.length > 0) whySucceed.push(`${s.weak_competitors.length} nearby competitors have poor ratings (<3.5★) — a direct quality opportunity`)
  if (!isDigitalTechGroup(businessGroup) && s.hours_opportunity) whySucceed.push(`Over 50% of nearby competitors are currently closed — an opening-hours gap exists in this market`)
  if (s.delivery_gap && data.delivery_needed && !isDigitalTechGroup(businessGroup)) whySucceed.push(`Fewer than 20% of nearby businesses offer delivery — strong delivery gap to capture`)
  if (scores.cultural_fit_score >= 75) whySucceed.push(`Strong demographic and community fit between your target audience and ${data.suburb}`)
  if (scores.pricing_fit_score >= 70 && s.price_gap === 'below_market') whySucceed.push(`Competitive pricing below the local average (${priceLevelLabel(nearby?.avg_price_level ?? null)}) — instant price appeal`)
  if (scores.demand_probability_score >= 75) whySucceed.push(`High demand signal — ${businessType} is a high-frequency category in Australian markets`)
  if (isDigitalTechGroup(businessGroup) && scores.digital_acquisition_strength_score >= 65) whySucceed.push(`Digital acquisition conditions are supportive — the business has room to compete on trust, conversion, and positioning instead of relying on foot traffic`)
  if (whySucceed.length < 3) whySucceed.push(`${data.suburb} has an active local economy matching your target demographic`)

  // ── Why fail — real risk signals ──────────────────────────────────────────
  const whyFail: string[] = []
  if (s.saturation_label === 'saturated') whyFail.push(`Market is saturated — ${count} competitors in ${data.radius_km}km (${s.density_per_sqkm.toFixed(1)}/km²) with no clear differentiation`)
  else if (s.strong_competitors.length >= 3) whyFail.push(`${s.strong_competitors.length} nearby competitors have 4.2+ star ratings and ${s.high_review_count > 0 ? s.high_review_count + ' have 200+ reviews' : 'established review bases'} — difficult to displace`)
  if (scores.break_even_months > 18) whyFail.push(`Estimated ${scores.break_even_months}-month break-even is high — requires strong cash reserves`)
  if (s.price_gap === 'above_market') whyFail.push(`Your pricing (${data.avg_price_range}) is above the local market average — insufficient differentiation makes this risky`)
  if (scores.cultural_fit_score < 55) whyFail.push(`Demographic mismatch — your target customer profile does not strongly align with ${data.suburb}'s community type`)
  if (isDigitalTechGroup(businessGroup) && scores.digital_maturity_score < 55) whyFail.push('Digital trust and acquisition foundations are still weak — the website, offer clarity, and visibility may not convert cold traffic efficiently')
  const budgetNum = parseInt(data.startup_budget?.replace(/[^0-9]/g, '') || '0')
  if (budgetNum > 0 && budgetNum < 30000) whyFail.push(`Startup budget of ${data.startup_budget} is likely insufficient — consider financing or reducing initial scope`)
  if (whyFail.length < 2) whyFail.push(`Without a clear unique selling proposition in a competitive market, customer acquisition costs will be high`)

  // ── Missing elements ──────────────────────────────────────────────────────
  const missing: string[] = []
  missing.push(`Defined USP vs existing ${count} competitors in ${data.radius_km}km radius`)
  if (!isDigitalTechGroup(businessGroup) && s.delivery_gap && !data.delivery_needed) missing.push(`Delivery capability — ${Math.round((1 - s.closed_count / Math.max(1, count)) * 100)}% of local customers expect online ordering in this category`)
  if (s.high_review_count === 0 && count > 0) missing.push(`Google review strategy — no nearby competitor has 200+ reviews, meaning first-mover SEO advantage is still available`)
  if (!isDigitalTechGroup(businessGroup) && s.hours_opportunity) missing.push(`Extended operating hours — competitors in this radius close early, leaving demand unmet during key periods`)
  if (isDigitalTechGroup(businessGroup)) missing.push('Clear acquisition engine — the current input does not yet show a strong SEO, paid, referral, or partnership moat')
  missing.push(`Pre-launch customer pipeline — social media presence and waitlist before opening day`)

  // ── Opportunities ─────────────────────────────────────────────────────────
  const opps: string[] = []
  if (s.weak_competitors.length > 0) opps.push(`${s.weak_competitors.length} poorly-rated competitor${s.weak_competitors.length > 1 ? 's' : ''} in radius (${s.weak_competitors[0].name}: ${s.weak_competitors[0].rating}★) whose customers are actively seeking alternatives`)
  if (!isDigitalTechGroup(businessGroup) && s.delivery_gap) opps.push(`Delivery market gap — underserved online ordering demand in ${data.suburb}`)
  if (!isDigitalTechGroup(businessGroup) && s.hours_opportunity) opps.push(`Late-hours opportunity — operate when competitors are closed to capture unmet demand`)
  if (count < 3) opps.push(`First-mover advantage in ${data.suburb || data.target_market} — establish brand recognition before competition arrives`)
  if (isDigitalTechGroup(businessGroup)) opps.push('Online competition matters more than suburb footfall here, so sharper positioning and stronger acquisition channels can create a faster advantage than physical expansion')
  if (opps.length < 2) opps.push(`Growing ${ageFocus} demographic in ${data.suburb || data.target_market} with increasing discretionary spending`)

  // ── Competitor threats from real data ─────────────────────────────────────
  const sorted = [...competitors].sort((a, b) => {
    const ra = (a.rating ?? 0) + Math.log10(Math.max(1, a.review_count ?? 1)) * 0.3
    const rb = (b.rating ?? 0) + Math.log10(Math.max(1, b.review_count ?? 1)) * 0.3
    return rb - ra
  })
  const threats: CompetitorThreat[] = sorted.slice(0, 5).map((c, i) => {
    const isStrong = (c.rating ?? 0) >= 4.2
    const isWeak   = (c.rating ?? 0) < 3.5 && c.rating !== null
    const level: CompetitorThreat['threat_level'] =
      isStrong && (c.review_count ?? 0) > 100 ? 'strong' :
      isStrong ? 'established' :
      isWeak ? 'opportunity' :
      'differentiation'

    const whyThreat = isStrong
      ? `${c.rating}★ rating with ${c.review_count ?? 'many'} reviews — established local trust and Google visibility`
      : isWeak
      ? `Despite ${c.rating}★ rating, still captures traffic due to location proximity (${c.distance_km ?? '?'}km away)`
      : `Moderate competitor at ${c.distance_km ?? '?'}km — ${c.review_count ?? '?'} reviews means some established customer base`

    const howToBeat = isStrong
      ? `Target their underserved gaps: ${(c.review_count ?? 0) > 200 ? 'analyse their 1–2 star reviews for repeated complaints' : 'compete on personalised service they cannot match at scale'}`
      : `Convert their dissatisfied customers — ${c.name} has a below-market rating, respond directly on Google with quality messaging`

    return { name: c.name, address: c.address, rating: c.rating, review_count: c.review_count, price_level: c.price_level, categories: c.categories, threat_level: level, why_threat: whyThreat, how_to_beat: howToBeat }
  })

  // ── Differentiation ───────────────────────────────────────────────────────
  const diff: string[] = []
  if (!isDigitalTechGroup(businessGroup) && s.hours_opportunity) diff.push(`Operate extended hours — competitors in ${data.suburb} close early, leaving late-afternoon and evening demand unmet`)
  if (s.price_gap === 'below_market') diff.push(`Lead with price accessibility — position clearly below the ${priceLevelLabel(nearby?.avg_price_level ?? null)} market average`)
  if (s.weak_competitors.length > 0) diff.push(`Build a quality-first brand — ${s.weak_competitors.length} nearby businesses have sub-3.5★ ratings, making quality a genuine differentiator`)
  if (!isDigitalTechGroup(businessGroup) && data.delivery_needed && s.delivery_gap) diff.push(`Launch with delivery from day one — delivery gap is a competitive advantage in this radius`)
  if (isDigitalTechGroup(businessGroup)) diff.push('Compete on clearer positioning, stronger proof, and a simpler conversion path rather than trying to win on locality alone')
  diff.push(`Invest in Google Business Profile and reviews — ${s.high_review_count === 0 ? 'no nearby competitor has cracked 200 reviews, meaning SEO dominance is still available' : 'reviews are the primary discovery channel in Australian local search'}`)

  // ── Underserved niche ─────────────────────────────────────────────────────
  const niche = `${count < 5 ? 'First-quality' : 'Premium'} ${businessType.split('/')[0].trim().toLowerCase()} targeting ${ageFocus} ${data.community_type?.includes('Student') ? 'students and graduates' : audienceFocus} in ${data.suburb || data.target_market} who currently have ${s.weak_competitors.length > 2 ? 'only poorly-rated options' : 'limited quality alternatives'}`

  // ── Suggestions for alternative locations ─────────────────────────────────
  const suggestions: string[] = [
    `${data.suburb} surrounds — 500m north/south may have ${Math.max(0, count - 2)} fewer competitors`,
    `Inner-city ${data.state.split(' ')[0]} corridor — higher foot traffic with similar demographic`,
    `University precinct near ${data.city || data.state} — high repeat-visit frequency`,
  ]

  return {
    summary,
    why_succeed: whySucceed.slice(0, 4),
    why_fail: whyFail.slice(0, 4),
    missing_elements: missing.slice(0, 4),
    opportunity_highlights: opps.slice(0, 3),
    competitor_threats: threats,
    why_competitors_succeed: [
      count > 0 ? `Top operators already match the local price expectation around ${priceLevelLabel(nearby?.avg_price_level ? Math.round(nearby.avg_price_level) : null)}.` : `Businesses in the ${getBusinessGroupLabel(businessGroup).toLowerCase()} group that win usually have clearer positioning and stronger visibility.`,
      s.strong_competitors.length > 0 ? `${s.strong_competitors.length} competitors have strong ratings, which usually means consistent service and clearer positioning.` : 'Competitors that specialise around a sharper audience tend to win faster.',
      isDigitalTechGroup(businessGroup)
        ? 'The strongest operators usually win on trust, conversion, and offer clarity rather than suburb foot traffic alone.'
        : data.delivery_needed
        ? 'Operators with easy ordering, delivery, and strong Google visibility tend to outperform slower operators.'
        : 'Operators with stronger reviews and better visibility usually convert more local demand.',
    ],
    best_differentiation: diff.slice(0, 4),
    best_underserved_niche: niche,
    suggestions,
  }
}

// ── Build recommendations from signals ───────────────────────────────────────
function buildRecommendations(data: BusinessFormData, scores: ScoringOutput): Recommendation[] {
  const businessType = getEffectiveBusinessType(data)
  const businessGroup = getBusinessGroup(data)
  const recs: Recommendation[] = []
  const s = scores.signals

  if (!isDigitalTechGroup(businessGroup) && s.hours_opportunity) {
    recs.push({ title: 'Extend your operating hours', description: `More than 50% of competitors in your radius are currently closed during key periods. Opening earlier or staying later directly captures unmet demand with no additional competition.`, priority: 'high', category: 'product' })
  }
  if (s.weak_competitors.length > 0) {
    recs.push({ title: `Outrate ${s.weak_competitors[0].name} (${s.weak_competitors[0].rating}★)`, description: `This nearby competitor has poor ratings. Actively request Google reviews from your first 30 customers and respond to all reviews within 24 hours to build social proof quickly.`, priority: 'high', category: 'marketing' })
  }
  if (s.price_gap === 'above_market') {
    recs.push({ title: 'Reconsider your pricing strategy', description: `Your pricing (${data.avg_price_range}) is above the local market average of ${priceLevelLabel(scores.signals.avg_competitor_rating !== null ? Math.round(scores.signals.avg_competitor_rating) : null)}. Without strong brand recognition, consider an introductory pricing tier for the first 3 months.`, priority: 'high', category: 'pricing' })
  }
  if (!isDigitalTechGroup(businessGroup) && s.delivery_gap && data.delivery_needed) {
    recs.push({ title: 'Launch on delivery platforms from day one', description: `Fewer than 20% of businesses in your radius offer delivery. DoorDash, Uber Eats, or your own delivery integration gives you immediate reach without physical foot-traffic dependency.`, priority: 'high', category: 'digital' })
  }
  if (isDigitalTechGroup(businessGroup)) {
    recs.push({ title: 'Sharpen acquisition before expanding physically', description: 'For digital and tech businesses, stronger positioning, clearer offers, and tighter conversion paths usually outperform suburb expansion early on.', priority: 'high', category: 'digital' })
  }
  recs.push({ title: 'Claim and optimise Google Business Profile', description: `Australian local search is dominated by Google Maps. Add high-quality photos, set accurate hours, and respond to every review. Aim for 50 reviews in your first 60 days.`, priority: 'high', category: 'digital' })
  if (scores.break_even_months > 14) {
    recs.push({ title: 'Build a 6-month cash buffer', description: `Your estimated ${scores.break_even_months}-month break-even means you need reserves beyond initial setup. Target 6 months of operating costs (rent + staff + COGS) before opening.`, priority: 'high', category: 'product' })
  }
  if (data.user_goal_mode === 'grow_existing') {
    recs.push({ title: 'Fix the main growth bottleneck first', description: `Prioritise the biggest current issue: ${data.current_challenges.slice(0, 2).join(' and ') || 'conversion and retention'}. Improving one broken system before expanding usually lifts revenue faster than launching new offers.`, priority: 'high', category: 'product' })
    recs.push({ title: 'Compare your offer to the best local operators', description: `Review pricing, product mix, service speed, and visibility against the strongest ${businessType.toLowerCase()} competitors in your Australian market.`, priority: 'medium', category: 'marketing' })
  }
  recs.push({ title: `Open with a 50-person preview event`, description: `Soft-launch to invited locals before public opening. This generates early reviews, lets you fix operational issues, and creates social media content before anyone pays full price.`, priority: 'medium', category: 'marketing' })
  if (scores.cultural_fit_score < 65) {
    recs.push({ title: 'Adapt offer to local community expectations', description: `${data.suburb}'s community profile (${data.community_type}) suggests your current offering may need localisation. Research what nearby high-rated competitors do differently to win local loyalty.`, priority: 'medium', category: 'community' })
  }
  recs.push({ title: 'Lock in supplier pricing before lease signing', description: `COGS is the primary margin killer in year one. Get written pricing agreements from your top 3 suppliers before you commit to a lease — costs can shift 15–30% once they know you're locked in.`, priority: 'medium', category: 'product' })

  return recs.slice(0, 6)
}

// ── Build roadmap from real timeline and budget ───────────────────────────────
function buildRoadmap(data: BusinessFormData, breakEvenMonths: number): RoadmapWeek[] {
  const isUrgent = /within 1 month|1.3 month/i.test(data.launch_timeline)
  if (data.user_goal_mode === 'grow_existing') {
    return [
      {
        period: 'Weeks 1-2',
        title: 'Diagnose what is limiting growth',
        tasks: [
          `Audit pricing, conversion, reviews, and foot traffic against your top local competitors.`,
          `Review current challenges: ${data.current_challenges.join(', ') || 'sales, conversion, and retention'}.`,
          'Identify the top 3 quick wins that can increase sales in the next 30 days.',
        ],
      },
      {
        period: 'Weeks 3-4',
        title: 'Tighten the offer and visibility',
        tasks: [
          'Refine pricing, hero products, and online calls-to-action based on the strongest competitor patterns.',
          'Improve Google Business Profile, website, and local landing pages before spending more on ads.',
          data.delivery_expansion ? 'Pilot an expanded delivery zone and track margin by suburb.' : 'Test one extra convenience channel such as delivery, online bookings, or click-and-collect.',
        ],
      },
      {
        period: 'Month 2',
        title: 'Retention and repeat revenue',
        tasks: [
          'Launch a repeat-customer or loyalty offer tied to your highest-margin products.',
          'Train staff around upsell, speed, and customer experience gaps seen in competitor reviews.',
          'Track weekly revenue and customer mix against the target you entered.',
        ],
      },
      {
        period: 'Month 3',
        title: 'Expansion decision gate',
        tasks: [
          data.new_suburb_expansion ? 'Compare nearby suburbs and shortlist the strongest expansion pocket.' : 'Validate whether a suburb expansion truly beats improving the current site first.',
          'Model contribution margin before signing a lease or increasing fixed overhead.',
          'Choose one expansion path: pricing, product mix, hours, delivery, or new suburb.',
        ],
      },
    ]
  }
  return [
    {
      period: isUrgent ? 'Week 1' : 'Week 1–2',
      title: 'Validation & regulatory',
      tasks: [
        `Confirm council zoning approval for ${data.business_type} at your target location`,
        'Submit ABN and business name registration (ASIC)',
        'Get 3 competing lease quotes within your suburb — use as negotiation leverage',
        data.business_type.match(/café|restaurant|food|bakery/i) ? 'Apply for food business registration with local council' : 'Identify all required licences and permit timelines',
      ],
    },
    {
      period: isUrgent ? 'Week 2' : 'Week 3–4',
      title: 'Brand, supplier & digital setup',
      tasks: [
        'Sign lease — budget 3× monthly rent as bond + first month',
        'Finalise brand identity (logo, colours, signage brief)',
        'Sign supplier agreements with locked-in pricing',
        'Register Google Business Profile and Instagram before fit-out begins',
      ],
    },
    {
      period: 'Month 2',
      title: 'Fit-out, hire & pre-launch',
      tasks: [
        'Complete fit-out — maintain 15% contingency buffer on all quotes',
        `Hire and onboard ${Math.max(1, data.staff_count - 1)} initial staff — allow 2 weeks for training before opening`,
        'Invite 50 locals to a preview — convert to first Google reviewers',
        'Begin social content: behind-the-scenes, countdown, meet the team',
      ],
    },
    {
      period: 'Month 3',
      title: 'Public launch & review sprint',
      tasks: [
        'Grand opening with local media pitch and community outreach',
        'Target 25 Google reviews in first 30 days post-launch',
        `Cut lowest-performing 20% of your ${data.business_type.includes('food') ? 'menu items' : 'services'} based on real sales data`,
        'Launch loyalty programme — repeat customers are 5× cheaper to retain than acquire',
      ],
    },
    {
      period: `Month 4–${breakEvenMonths + 1}`,
      title: 'Optimise toward break-even',
      tasks: [
        'Review P&L weekly — target 30%+ gross margin by end of month 4',
        `${data.delivery_needed ? 'Activate second delivery platform after validating first-platform unit economics' : 'Evaluate delivery demand — if >15% of customers ask, add it'}`,
        `Scale hours or staff once daily revenue consistently exceeds ${data.startup_budget ? '$' + Math.round(parseInt(data.startup_budget.replace(/\D/g, '') || '50000') / 365) : '$300'} per day`,
        `At month ${breakEvenMonths}: run full P&L review — plan location 2 or franchise pathway`,
      ],
    },
  ]
}

// ── Build alternative locations ───────────────────────────────────────────────
function buildAlternatives(data: BusinessFormData, scores: ScoringOutput): AlternativeLocation[] {
  const base = scores.success_score
  return [
    {
      name: `${data.suburb} — 500m radius shift`,
      suburb: data.suburb,
      postcode: data.postcode,
      score: Math.min(97, base + Math.round(3 + Math.random() * 5)),
      reason: `Same suburb, different street — ${scores.signals.competitor_count > 0 ? 'competitor-free pocket just 500m from your current selection' : 'maximise foot-traffic position near transport or shopping precinct'}`,
    },
    {
      name: `${data.city || data.state} inner corridor`,
      score: Math.min(97, base + Math.round(6 + Math.random() * 8)),
      reason: `Higher foot traffic with ${Math.max(0, scores.signals.competitor_count - 2)} fewer direct competitors — 20–35% higher rent offset by volume`,
    },
    {
      name: `University / TAFE precinct near ${data.city || data.state}`,
      score: Math.min(95, base + Math.round(2 + Math.random() * 6)),
      reason: 'Student and young-professional base drives repeat visits 4–5× per week — lowest CAC of any Australian suburb archetype',
    },
  ]
}

// ── Fallback without OpenAI ───────────────────────────────────────────────────
export function buildFallbackAnalysis(data: BusinessFormData, nearby: NearbyCompetitorData | null, scores: ScoringOutput): AnalysisResult {
  const content = buildSignalDrivenContent(data, nearby, scores)
  const recommendations = buildRecommendations(data, scores)
  const roadmap = buildRoadmap(data, scores.break_even_months)
  const alternatives = buildAlternatives(data, scores)
  const setupChecklist = getAustraliaSetupChecklist(data)
  const isEstimated = nearby?.source !== 'google' && nearby?.source !== 'osm'
  const businessType = getEffectiveBusinessType(data)
  const importantAssumptions = [
    nearby ? `Competitor analysis uses ${nearby.source} data for the selected radius.` : 'Competitor availability is limited, so some local intelligence is estimated.',
    data.user_goal_mode === 'grow_existing'
      ? 'Operational and digital audit findings are based on the owner inputs provided in the workflow.'
      : 'Startup assumptions depend on the stated budget, launch timing, audience, and price positioning.',
    'Australian permits and setup guidance is rules-based and should be checked with the relevant council or regulator before investing.',
  ]
  const businessSpecificEdge = /café|cafe|coffee/i.test(businessType)
    ? {
        opportunity: 'Lift breakfast and lunch conversion, improve repeat visits, and turn Google reviews into weekday traffic.',
        bottleneck: 'Weak breakfast/lunch conversion or low repeat traffic usually caps café growth.',
      }
    : /barber|beauty/i.test(businessType)
    ? {
        opportunity: 'Improve appointment utilisation, rebooking cycle, and Google Maps visibility for local discovery.',
        bottleneck: 'Idle chair time and inconsistent rebooking usually hold barbers and salons back.',
      }
    : /grocery|convenience/i.test(businessType)
    ? {
        opportunity: 'Lift basket size, sharpen margin by supplier, and close any cultural product range gaps in the suburb.',
        bottleneck: 'Basket size and supplier margin pressure usually determine whether grocery expansion works.',
      }
    : /it|tech/i.test(businessType)
    ? {
        opportunity: 'Improve lead conversion, local B2B positioning, and higher-value retainer packaging.',
        bottleneck: 'Weak enquiry conversion and low retainer penetration usually slow IT service growth.',
      }
    : {
        opportunity: 'Tighten conversion, visibility, and customer retention before expanding fixed cost.',
        bottleneck: 'Positioning and conversion weakness usually limit growth before demand does.',
      }
  const revenueLeakagePoints = data.user_goal_mode === 'grow_existing'
    ? [
        data.repeat_customer_rate < 30 ? `Repeat customer rate is only ${data.repeat_customer_rate}% — retention is leaking revenue.` : 'Retention is healthier, but loyalty can still be strengthened.',
        Number(data.average_google_rating || '0') > 0 && Number(data.average_google_rating || '0') < 4.3 ? `Google rating at ${data.average_google_rating} is likely reducing local conversion.` : 'Review strength is not the main leakage point.',
        parseInt(data.average_basket_value.replace(/\D/g, '') || '0', 10) < 20 ? 'Average basket value is low for a growth push — upsell and mix need work.' : 'Basket size is workable but can still improve.',
      ]
    : ['Demand, pricing, and setup remain the main pre-launch leakage risks.']
  const operationalBottlenecks = data.user_goal_mode === 'grow_existing'
    ? [...data.current_challenges.slice(0, 4).map(item => `${item} is currently constraining growth.`), businessSpecificEdge.bottleneck]
    : ['No live operating bottlenecks captured yet because this is a startup workflow.']
  const pricingUplift = data.user_goal_mode === 'grow_existing'
    ? [
        data.average_gross_margin < 45 ? 'Gross margin is under pressure, so pricing architecture and discount discipline need attention.' : 'Margin base is acceptable, but premium tiers or bundles could lift profit.',
        `Use your ${data.avg_price_range} positioning against local competitors to test premium bundles or anchored entry offers.`,
      ]
    : ['Test price-fit early against competitor expectations in the target area.']
  const localSeoWeakness = data.user_goal_mode === 'grow_existing'
    ? [
        data.google_review_count < 50 ? `Only ${data.google_review_count} reviews means weaker Google Maps trust than stronger local operators.` : 'Review count is solid, but freshness and response quality still matter.',
        /poor|basic/i.test(data.existing_online_presence) ? 'Online presence is weak relative to what Australian local search now expects.' : 'Online presence exists, but conversion quality can still improve.',
      ]
    : ['Local SEO should be built before launch, especially Google Business Profile.']
  const deliverySuggestion = data.user_goal_mode === 'grow_existing'
    ? [
        data.delivery_expansion || data.growth_strategy_type === 'Expand delivery radius'
          ? 'Test delivery expansion into adjacent high-fit suburbs first, then watch margin by zone.'
          : 'Only expand delivery after confirming unit economics and prep capacity.',
      ]
    : ['Add delivery only if it improves accessibility without crushing margin.']
  const retentionFixes = data.user_goal_mode === 'grow_existing'
    ? [
        data.repeat_customer_rate < 30 ? 'Create a repeat-customer offer tied to your strongest product or service.' : 'Strengthen retention with CRM follow-ups and referral prompts.',
        'Use review requests, loyalty mechanics, and post-purchase follow-up to lift repeat visits.',
      ]
    : []
  const repeatPlaybook = data.user_goal_mode === 'grow_existing'
    ? [
        'Identify the top 20% of customers by frequency and average spend.',
        'Design one repeat trigger: loyalty, subscription, rebooking, or bundled upsell.',
        'Measure repeat rate weekly and tie it to one manager-owned KPI.',
      ]
    : []
  const costReduction = data.user_goal_mode === 'grow_existing'
    ? [
        parseInt(data.monthly_fixed_costs.replace(/\D/g, '') || '0', 10) > parseInt(data.current_monthly_revenue.replace(/\D/g, '') || '0', 10) * 0.3
          ? 'Fixed costs are heavy relative to revenue, so renegotiating lease, utilities, or roster design should be reviewed.'
          : 'Fixed costs look manageable, but supplier terms and roster productivity can still improve.',
        /high/i.test(data.supplier_dependency_risk) ? 'Reduce single-supplier exposure before it damages margin or stock continuity.' : 'Supplier concentration is not the biggest current cost issue.',
      ]
    : []
  const staffUtilisation = data.user_goal_mode === 'grow_existing'
    ? [
        data.current_challenges.includes('Overstaffing') ? 'Roster hours are likely ahead of demand and need tightening by trading day.' : 'Check roster alignment between busiest and quietest days.',
        data.current_challenges.includes('Understaffing') ? 'Understaffing may be hurting service speed and repeat visits during peak periods.' : 'Set labour targets by hour and monitor service bottlenecks.',
      ]
    : []
  const supplierRisks = data.user_goal_mode === 'grow_existing'
    ? [
        /high/i.test(data.supplier_dependency_risk) ? 'High supplier dependency risk is a material business continuity issue.' : 'Supplier dependency risk is currently manageable.',
        /grocery/i.test(businessType) ? 'Review product mix against local cultural demand so supplier range supports higher-margin baskets.' : `Make sure supplier choices support the positioning of your ${businessType.toLowerCase()}.`,
      ]
    : []
  const topActions = data.user_goal_mode === 'grow_existing'
    ? [
        'Lift Google review velocity and respond to every review within 24 hours.',
        'Tighten the offer, pricing ladder, and upsell path to improve margin and basket size.',
        'Fix the weakest conversion point across website, enquiry handling, and in-store follow-up.',
        'Launch one retention mechanism: loyalty, rebooking, CRM follow-up, or subscription.',
        'Validate second-branch or delivery expansion only after current-site economics improve.',
      ]
    : [
        'Validate demand and pricing before committing capital.',
        'Confirm setup, permits, and supplier assumptions.',
        'Build digital trust early with Google and a lightweight web presence.',
        'Focus on one clear audience and one sharp offer.',
        'Review competitor gaps before signing a lease.',
      ]
  const growthOpportunities = data.user_goal_mode === 'grow_existing'
    ? [
        `Lift performance at the current business by fixing ${data.current_challenges[0] ?? 'conversion and visibility'} first.`,
        data.new_suburb_expansion ? 'Compare nearby suburbs with lower saturation before committing to a second site.' : 'Explore a radius or suburb shift only after the current offer is converting well.',
        data.delivery_expansion ? 'Expand delivery selectively into higher-value catchments and measure margin by area.' : 'Test delivery, click-and-collect, or bookings before taking on more rent.',
        businessSpecificEdge.opportunity,
      ]
    : [
        `Look for a clearer gap in ${data.suburb || data.target_market || data.state} before launch.`,
        'Use pricing, speed, or convenience to differentiate from stronger incumbents.',
        'Delay a lease if setup costs or break-even timing still look stretched.',
      ]
  const whatToFixFirst = data.user_goal_mode === 'grow_existing'
    ? [
        data.current_challenges[0] ? `Fix ${data.current_challenges[0].toLowerCase()} first.` : 'Fix the biggest sales bottleneck first.',
        'Tighten pricing and hero offers before expanding fixed costs.',
        'Strengthen reviews, local SEO, and conversion before widening geography.',
        businessSpecificEdge.bottleneck,
      ]
    : [
        'Validate demand in the chosen suburb or market before spending heavily.',
        'Confirm setup permits, suppliers, and working capital assumptions.',
        'Sharpen your audience and price point before signing a lease.',
      ]
  const improvementPlan = data.user_goal_mode === 'grow_existing'
    ? [
        'Compare your price architecture, product mix, and convenience against the top competitors in this report.',
        'Use reviews and customer feedback to remove friction from service, delivery, and online discovery.',
        'Improve one growth lever at a time: pricing, product mix, hours, delivery, or suburb expansion.',
      ]
    : []
  const expansionOptions = data.user_goal_mode === 'grow_existing'
    ? [
        data.new_suburb_expansion ? 'Open in a lower-saturation nearby suburb if unit economics stay healthy.' : 'Only expand suburbs after fixing the current store economics.',
        data.delivery_expansion ? 'Broaden delivery carefully into high-fit catchments and watch fulfilment costs.' : 'Trial limited delivery or online ordering before adding a new site.',
        'Consider extended hours or revised product mix before committing to a full second location.',
      ]
    : [
        'Test a different radius or better-matched suburb if saturation stays high.',
        'Launch as a smaller pilot offer before committing to a full-scale fit-out.',
      ]
  const executiveSummary = data.user_goal_mode === 'grow_existing'
    ? `This business shows a ${scores.business_viability_score}/100 viability profile with ${scores.decision_confidence_score}/100 decision confidence. The fastest upside sits in ${data.current_challenges[0]?.toLowerCase() ?? 'conversion, retention, and visibility'}, while suburb, delivery, and digital expansion should be gated by current-site economics first.`
    : `This concept shows a ${scores.business_viability_score}/100 viability profile with ${scores.decision_confidence_score}/100 decision confidence. The opportunity depends on local differentiation, realistic pricing, and validating demand before committing to lease or fit-out cost.`
  const fastestGrowthLevers = data.user_goal_mode === 'grow_existing'
    ? [
        data.current_challenges[0] ? `Fix ${data.current_challenges[0].toLowerCase()} before taking on more complexity.` : 'Fix the biggest visible conversion or retention constraint first.',
        'Strengthen pricing, hero offers, and upsell paths to improve margin.',
        'Lift Google visibility, reviews, and digital conversion before expanding geography.',
      ]
    : [
        'Sharpen one audience and one hero offer before launch.',
        'Use pricing and convenience to stand apart from stronger incumbents.',
        'Delay major spend until the suburb and demand assumptions hold up.',
      ]
  const actionPlan30Day = topActions.slice(0, 5)
  const keyBottlenecks = data.user_goal_mode === 'grow_existing'
    ? operationalBottlenecks.slice(0, 4)
    : content.why_fail.slice(0, 4)

  return {
    ...scores,
    executive_summary: executiveSummary,
    ...content,
    key_bottlenecks: keyBottlenecks,
    fastest_growth_levers: fastestGrowthLevers,
    recommendations,
    growth_opportunities: growthOpportunities,
    recommended_actions: recommendations.map(item => item.title),
    setup_checklist: setupChecklist,
    setup_checklist_summary: `${setupChecklist[0]?.items.length ?? 0} Australian setup and permit items flagged for this business type.`,
    what_to_fix_first: whatToFixFirst,
    how_to_improve_current_business: improvementPlan,
    expansion_options: expansionOptions,
    revenue_leakage_points: revenueLeakagePoints,
    operational_bottlenecks: operationalBottlenecks,
    pricing_uplift_opportunities: pricingUplift,
    local_seo_google_review_weakness: localSeoWeakness,
    delivery_radius_expansion_suggestion: deliverySuggestion,
    customer_retention_fixes: retentionFixes,
    repeat_customer_playbook: repeatPlaybook,
    cost_reduction_opportunities: costReduction,
    staff_utilisation_issues: staffUtilisation,
    supplier_dependency_risks: supplierRisks,
    top_90_day_actions: topActions,
    action_plan_30_day: actionPlan30Day,
    important_assumptions: importantAssumptions,
    section_sources: {
      nearby_competitors: isEstimated ? 'estimated' : 'real_data',
      market_gaps: isEstimated ? 'estimated' : 'real_data',
      recommendations: isEstimated ? 'estimated' : 'real_data',
      setup_checklist: 'rules_based',
      growth_opportunities: isEstimated ? 'estimated' : 'real_data',
    },
    roadmap,
    alternative_locations: alternatives,
    suggested_better_suburb: {
      name: alternatives[0].name,
      suburb: data.suburb,
      postcode: data.postcode,
      score: alternatives[0].score,
      reason: alternatives[0].reason,
    },
    nearby_data: nearby,
  }
}

// ── Main export — OpenAI with formula-based scores pre-calculated ─────────────
export async function generateAnalysis(
  data: BusinessFormData,
  nearby: NearbyCompetitorData | null,
  scores: ScoringOutput
): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[openai] No API key — using signal-driven fallback')
    return buildFallbackAnalysis(data, nearby, scores)
  }

  const s = scores.signals
  const businessType = getEffectiveBusinessType(data)
  const competitorLines = (nearby?.competitors ?? []).slice(0, 12).map((c, i) =>
    `${i+1}. ${c.name} | ${c.address} | ${c.rating ?? 'no rating'}★ (${c.review_count ?? '?'} reviews) | price_level=${c.price_level ?? '?'}/4 | open=${c.open_now ?? '?'} | dist=${c.distance_km ?? '?'}km`
  ).join('\n')

  const signalBlock = `
PRE-CALCULATED SCORES (do NOT override these):
success_score=${scores.success_score}
cultural_fit_score=${scores.cultural_fit_score}
competitor_saturation_score=${scores.competitor_saturation_score}
pricing_fit_score=${scores.pricing_fit_score}
failure_risk_score=${scores.failure_risk_score}
opportunity_gap_score=${scores.opportunity_gap_score}
demand_probability_score=${scores.demand_probability_score}
break_even_months=${scores.break_even_months}

MARKET SIGNALS:
competitor_count=${s.competitor_count}
avg_competitor_rating=${s.avg_competitor_rating ?? 'unknown'}
weak_competitors(below 3.5★)=${s.weak_competitors.length}: ${s.weak_competitors.map(c => c.name).join(', ')}
strong_competitors(4.2+★)=${s.strong_competitors.length}: ${s.strong_competitors.map(c => c.name).join(', ')}
price_gap=${s.price_gap}
hours_opportunity=${s.hours_opportunity}
delivery_gap=${s.delivery_gap}
density_per_sqkm=${s.density_per_sqkm}
market_maturity=${s.market_maturity}
data_source=${nearby?.source ?? 'none'}
`

  const prompt = `You are Australia's leading AI business feasibility analyst.

BUSINESS INPUT:
- Model: ${data.business_model_type}
- Goal mode: ${data.user_goal_mode}
- Concept: ${data.business_concept || 'not stated'}
- Location: ${data.suburb || data.target_market || 'Australia'}, ${data.city}, ${data.state} ${data.postcode}
- Business: ${businessType}
- Services: ${data.products_services}
- Price range: ${data.avg_price_range || 'not stated'}
- Budget: ${data.startup_budget || 'not stated'}
- Staff: ${data.staff_count}
- Hours: ${data.operating_hours || 'not stated'}
- Target customers: ${data.target_customers.join(', ') || 'not stated'}
- Demand zone: ${data.demand_zone_type || 'not stated'}
- Anchor locations: ${data.anchor_locations.join(', ') || 'not stated'}
- Community: ${data.community_type || 'not stated'}
- Income level: ${data.income_level || 'not stated'}
- Age groups: ${data.target_age_groups.join(', ') || 'not stated'}
- Audience types: ${data.audience_types.join(', ') || 'not stated'}
- Meal-time demand: ${data.lunch_dinner_demand || 'not stated'}
- Weekend traffic: ${data.weekend_traffic_level || 'not stated'}
- Online ordering importance: ${data.online_ordering_importance || 'not stated'}
- Foot traffic expectation: ${data.foot_traffic_expectation || 'not stated'}
- Supply model: ${data.supply_model || 'not stated'}
- Launch inventory: ${data.launch_inventory_assumption || 'not stated'}
- Launch: ${data.launch_timeline}
- Break-even expectation: ${data.break_even_expectation || 'not stated'}
- Risk tolerance: ${data.risk_tolerance}
- Current revenue: ${data.current_monthly_revenue || 'not stated'}
- Target revenue: ${data.target_monthly_revenue || 'not stated'}
- Current challenges: ${data.current_challenges.join(', ') || 'not stated'}
- Existing online presence: ${data.existing_online_presence || 'not stated'}
- Expansion goal: ${data.expansion_goal || data.growth_goal || 'not stated'}

REAL NEARBY COMPETITORS (${nearby?.source ?? 'none'}, ${s.competitor_count} found within ${data.radius_km}km):
${competitorLines || 'None found'}

${signalBlock}

Using the REAL data above, generate a compelling, location-specific feasibility report. All numerical scores MUST match the pre-calculated values above. The text content must reference specific competitor names and real market signals.

Return ONLY valid JSON matching this exact schema:
{
  "success_score": ${scores.success_score},
  "cultural_fit_score": ${scores.cultural_fit_score},
  "competitor_saturation_score": ${scores.competitor_saturation_score},
  "pricing_fit_score": ${scores.pricing_fit_score},
  "failure_risk_score": ${scores.failure_risk_score},
  "opportunity_gap_score": ${scores.opportunity_gap_score},
  "demand_probability_score": ${scores.demand_probability_score},
  "break_even_months": ${scores.break_even_months},
  "summary": "<2-3 sentences citing real competitor count, density, and price gap>",
  "why_succeed": ["<cite specific competitor weakness or gap>","<cite real signal>","<cite real signal>"],
  "why_fail": ["<cite real saturation/pricing risk>","<cite real signal>","<cite real signal>"],
  "missing_elements": ["<specific gap>","<specific gap>","<specific gap>"],
  "opportunity_highlights": ["<cite weak competitor or gap>","<cite real signal>"],
  "competitor_threats": [
    { "name":"<exact name from data>","address":"<exact address>","rating":<exact float or null>,"review_count":<exact int or null>,"price_level":<int or null>,"categories":["<cat>"],"threat_level":"strong|established|opportunity|differentiation","why_threat":"<specific to their actual data>","how_to_beat":"<actionable tactic vs this specific competitor>" }
  ],
  "best_differentiation": ["<specific tactic vs named competitor>","<hours/delivery/price tactic>","<review strategy>"],
  "best_underserved_niche": "<specific niche based on gap analysis>",
  "suggested_better_suburb": { "name":"<nearby suburb>","suburb":"<suburb>","postcode":"<postcode>","score":<int within 10 of success_score>,"reason":"<specific data-driven reason>" },
  "recommendations": [
    { "title":"<specific action>","description":"<1-2 sentences with real data>","priority":"high|medium|low","category":"location|pricing|marketing|product|digital|community" }
  ],
  "roadmap": [
    { "period":"Week 1–2","title":"<milestone>","tasks":["<specific task>","<specific task>","<specific task>"] },
    { "period":"Week 3–4","title":"<milestone>","tasks":["<task>","<task>","<task>"] },
    { "period":"Month 2","title":"<milestone>","tasks":["<task>","<task>","<task>"] },
    { "period":"Month 3","title":"<milestone>","tasks":["<task>","<task>","<task>"] },
    { "period":"Month 4–${scores.break_even_months + 1}","title":"Optimise to break-even","tasks":["<task>","<task>","<task>"] }
  ],
  "alternative_locations": [
    { "name":"<suburb name>","suburb":"<suburb>","score":<int>,"reason":"<data-driven reason>" },
    { "name":"<suburb name>","suburb":"<suburb>","score":<int>,"reason":"<data-driven reason>" }
  ]
}`

  try {
    const client = getClient()
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 3800,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('Empty OpenAI response')

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned) as Partial<AnalysisResult>
    const fallback = buildFallbackAnalysis(data, nearby, scores)

    // Enforce pre-calculated scores — AI cannot override them
    return {
      ...fallback,
      ...parsed,
      success_score: scores.success_score,
      cultural_fit_score: scores.cultural_fit_score,
      competitor_saturation_score: scores.competitor_saturation_score,
      pricing_fit_score: scores.pricing_fit_score,
      failure_risk_score: scores.failure_risk_score,
      opportunity_gap_score: scores.opportunity_gap_score,
      demand_probability_score: scores.demand_probability_score,
      break_even_months: scores.break_even_months,
      nearby_data: nearby,
    }
  } catch (err) {
    console.error('[openai] error, using signal fallback:', err)
    return buildFallbackAnalysis(data, nearby, scores)
  }
}
