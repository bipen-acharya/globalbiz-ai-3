import OpenAI from 'openai'
import type {
  AnalysisResult,
  NearbyCompetitorData,
  NearbyPlace,
  Recommendation,
  RoadmapWeek,
  AlternativeLocation,
  CompetitorThreat,
  ExistingBusinessFormData,
} from '@/types'
import type { ScoringOutput } from './scoring-engine'
import { priceLevelLabel } from './utils'

function getClient(): OpenAI {
  const k = process.env.OPENAI_API_KEY
  if (!k) throw new Error('OPENAI_API_KEY not set')
  return new OpenAI({ apiKey: k })
}

// ── Signal-driven turnaround text ─────────────────────────────────────────────
function buildTurnaroundContent(
  data: ExistingBusinessFormData,
  nearby: NearbyCompetitorData | null,
  scores: ScoringOutput
) {
  const s = scores.signals
  const competitors = nearby?.competitors ?? []
  const count = s.competitor_count
  const loc = [data.suburb, data.state].filter(Boolean).join(', ')
  const problems = data.problems.join(', ') || 'general underperformance'

  // ── Summary ───────────────────────────────────────────────────────────────
  const densityWord = { low: 'low', medium: 'moderate', high: 'high', saturated: 'saturated' }[s.saturation_label] ?? 'moderate'
  const healthWord = scores.current_health_score >= 70 ? 'healthy baseline' : scores.current_health_score >= 50 ? 'moderate operating position' : 'significant underperformance'
  const summary = `${data.business_name || data.business_type} in ${loc} shows a ${healthWord}. ${count} similar businesses operate nearby (${densityWord} density). Primary issues flagged: ${problems}. The turnaround focus should be ${data.owner_goal === 'Fix and grow the existing business' ? 'fixing operational constraints and recovering revenue' : data.owner_goal === 'Pivot to a different offering' ? 'evaluating a strategic pivot before further investment' : data.owner_goal === 'Sell or exit the business' ? 'positioning the business for exit' : 'validating expansion economics before committing capital'}.`

  // ── What's working ───────────────────────────────────────────────────────
  const whatsWorking: string[] = []
  if (data.years_operating.includes('3–5') || data.years_operating.includes('5+')) {
    whatsWorking.push(`Established presence — ${data.years_operating} of operation means local brand recognition already exists`)
  }
  if (data.staff_count > 0) {
    whatsWorking.push(`Operating team of ${data.staff_count} staff provides capacity for a turnaround without major hiring`)
  }
  if (s.weak_competitors.length > 0) {
    whatsWorking.push(`${s.weak_competitors.length} nearby competitors have sub-3.5★ ratings — quality positioning is still available`)
  }
  if (count < 5) {
    whatsWorking.push(`Low local competition (${count} direct competitors) — market share is recoverable without needing to be the lowest-cost operator`)
  }
  if (data.website_url || data.social_handles) {
    whatsWorking.push('Digital presence already established — improving it is faster than building from scratch')
  }
  if (whatsWorking.length < 3) {
    whatsWorking.push(`${data.business_type} category has repeat-purchase potential — fixing retention is faster than acquiring new customers`)
  }

  // ── Root causes of underperformance ──────────────────────────────────────
  const rootCauses: string[] = []
  if (data.problems.includes('Losing customers to competitors')) {
    const strong = s.strong_competitors.slice(0, 2).map(c => c.name).join(' and ')
    rootCauses.push(`Competitor displacement — ${strong || 'nearby operators'} are winning on rating, reviews, or convenience`)
  }
  if (data.problems.includes('Revenue has been declining')) {
    rootCauses.push('Revenue decline points to lost repeat customers, reduced basket size, or pricing below what costs require')
  }
  if (data.problems.includes('Poor online visibility / reviews')) {
    rootCauses.push(`Weak digital discovery — Google Maps visibility and review velocity are likely below what the ${count > 0 ? count + ' local competitors expect' : 'market now requires'}`)
  }
  if (data.problems.includes('Wrong location or foot traffic dropped')) {
    rootCauses.push('Location economics have shifted — foot traffic decline is usually structural, not seasonal, and needs a strategic response')
  }
  if (data.problems.includes('Pricing too high or too low')) {
    rootCauses.push(`Pricing misalignment — the local market average is around ${priceLevelLabel(nearby?.avg_price_level ?? null)}, and the current structure may be losing customers or margin`)
  }
  if (data.problems.includes('Staff or operational issues')) {
    rootCauses.push('Operational friction is likely creating inconsistency in service quality — the primary driver of lost repeat customers in Australian hospitality and retail')
  }
  if (rootCauses.length === 0) {
    rootCauses.push(`Positioning and differentiation gap — with ${count} similar operators in the area, the business needs a clearer reason to choose over alternatives`)
    rootCauses.push('Without clear diagnosis data, the most likely root cause is weak conversion or retention — these decay slowly and are often invisible until revenue drops sharply')
  }

  // ── Competitor gap analysis ───────────────────────────────────────────────
  const gapAnalysis: string[] = []
  if (s.strong_competitors.length > 0) {
    const top = s.strong_competitors[0]
    gapAnalysis.push(`${top.name} (${top.rating}★, ${top.review_count ?? '?'} reviews) is the benchmark — review their Google listing for what customers value most`)
  }
  if (s.hours_opportunity) {
    gapAnalysis.push('Extended trading hours gap — over half of local competitors close early, leaving late-demand unmet')
  }
  if (s.delivery_gap) {
    gapAnalysis.push('Delivery and online ordering gap — fewer than 20% of nearby businesses offer it, leaving digital demand uncaptured')
  }
  if (s.weak_competitors.length > 0) {
    gapAnalysis.push(`${s.weak_competitors.length} nearby operators have poor ratings — their dissatisfied customers are actively looking for alternatives`)
  }
  gapAnalysis.push(`Google review velocity: if the business has fewer than ${Math.max(20, count * 8)} reviews, it is likely ranking below at least 3 local competitors in Maps search`)

  // ── Competitor threats ────────────────────────────────────────────────────
  const sorted = [...competitors].sort((a, b) => {
    const ra = (a.rating ?? 0) + Math.log10(Math.max(1, a.review_count ?? 1)) * 0.3
    const rb = (b.rating ?? 0) + Math.log10(Math.max(1, b.review_count ?? 1)) * 0.3
    return rb - ra
  })
  const threats: CompetitorThreat[] = sorted.slice(0, 5).map(c => {
    const isStrong = (c.rating ?? 0) >= 4.2
    const isWeak = (c.rating ?? 0) < 3.5 && c.rating !== null
    const level: CompetitorThreat['threat_level'] = isStrong && (c.review_count ?? 0) > 100 ? 'strong' : isStrong ? 'established' : isWeak ? 'opportunity' : 'differentiation'
    const whyThreat = isStrong
      ? `${c.rating}★ with ${c.review_count ?? '?'} reviews — customers trust them over a business with weaker signals`
      : isWeak
      ? `Only ${c.rating}★ but still captures foot traffic — their dissatisfied customers are available to win`
      : `${c.review_count ?? '?'} reviews and ${c.rating}★ — a solid baseline your business needs to match or beat`
    const howToBeat = isStrong
      ? 'Analyse their 1–2 star reviews for repeating complaints and fix those specifically in your offer'
      : `Active outreach to their dissatisfied customers — ${c.name} is losing them, you just need to be visible`
    return { name: c.name, address: c.address, rating: c.rating, review_count: c.review_count, price_level: c.price_level, categories: c.categories, threat_level: level, why_threat: whyThreat, how_to_beat: howToBeat }
  })

  // ── Top 5 fixes in ROI order ──────────────────────────────────────────────
  const top5Fixes: string[] = []
  if (data.problems.includes('Poor online visibility / reviews') || !data.google_maps_url) {
    top5Fixes.push('Fix 1 (highest ROI): Claim and optimise Google Business Profile — add photos, accurate hours, respond to every review within 24 hours. Target 30 new reviews in 30 days.')
  }
  if (data.problems.includes('Losing customers to competitors')) {
    top5Fixes.push('Fix 2: Audit top competitor pricing, product mix, and convenience — identify the single biggest gap and close it in 2 weeks')
  }
  top5Fixes.push('Fix 3: Implement one retention mechanism immediately — loyalty stamp, rebooking prompt, or CRM follow-up email')
  if (data.problems.includes('Pricing too high or too low')) {
    top5Fixes.push(`Fix 4: Rebuild the pricing ladder — anchor, core, and premium tiers matched to the local market average (${priceLevelLabel(nearby?.avg_price_level ?? null)})`)
  } else {
    top5Fixes.push('Fix 4: Upsell architecture — add one cross-sell or bundle offer to the top 2 best-performing products or services')
  }
  top5Fixes.push('Fix 5: 90-day weekly revenue target — set a specific number, track it every Friday, and cut anything that doesn\'t contribute within 3 weeks')

  // ── 90-day turnaround roadmap ─────────────────────────────────────────────
  const roadmap: RoadmapWeek[] = [
    {
      period: 'Week 1–2',
      title: 'Diagnose and stabilise',
      tasks: [
        'Audit Google Business Profile, reviews, and competitor listings side by side',
        `Map the main problem (${data.problems[0] ?? 'underperformance'}) to a specific customer-visible symptom`,
        'Interview 5 recent customers — ask why they came, what nearly stopped them, and what would bring them back',
      ],
    },
    {
      period: 'Week 3–4',
      title: 'Fix the highest-ROI issue first',
      tasks: [
        top5Fixes[0].replace('Fix 1 (highest ROI): ', ''),
        'Launch a review request campaign — SMS, email, or in-person receipt prompt',
        data.problems.includes('Losing customers to competitors')
          ? 'Make one visible change that directly addresses the top competitor advantage (price, hours, product, or convenience)'
          : 'Test one pricing or product change based on what you\'ve learned from customers',
      ],
    },
    {
      period: 'Month 2',
      title: 'Build retention and conversion',
      tasks: [
        'Launch a repeat-customer offer — loyalty, subscription, bundle, or referral programme',
        'Improve one digital touchpoint: website booking, Google listing photos, or social media consistency',
        'Track weekly revenue and compare to the same period last year — set a floor target and stick to it',
      ],
    },
    {
      period: 'Month 3',
      title: `${data.owner_goal === 'Fix and grow the existing business' ? 'Grow: scale what\'s working' : data.owner_goal === 'Expand to a second location' ? 'Validate second location economics' : data.owner_goal === 'Pivot to a different offering' ? 'Pilot the pivot offer' : 'Prepare exit documentation'}`,
      tasks: data.owner_goal === 'Expand to a second location'
        ? ['Model contribution margin for the second site before any lease commitment', 'Survey existing customers — what percentage would use a second location?', 'Shortlist 3 suburban alternatives with lower saturation than current site']
        : data.owner_goal === 'Pivot to a different offering'
        ? ['Run a 30-day pilot of the new offering alongside the existing one', 'Set a revenue gate: if the pivot doesn\'t hit $X in month 3, reassess before full switch', 'Inform existing customers of the change 3 weeks in advance — some may follow']
        : data.owner_goal === 'Sell or exit the business'
        ? ['Document recurring revenue, supplier contracts, and lease terms for an information memo', 'Improve Google rating to 4.0+ before listing — it directly affects sale price', 'Engage a business broker for a realistic valuation in the current local market']
        : ['Scale the highest-performing product or service — add capacity, not complexity', 'Set a 30-day action plan for the next quarter based on what month 1–2 data shows', 'Review pricing — if margins improved, test a 5–8% price increase on the least price-sensitive SKU'],
    },
  ]

  // ── Recommendations ───────────────────────────────────────────────────────
  const recs: Recommendation[] = [
    { title: 'Optimise Google Business Profile immediately', description: `Australian local search is review-driven. Add photos, correct hours, and target 30 reviews in 30 days. ${count > 0 ? `You have ${count} competitors to catch up with.` : ''}`, priority: 'high', category: 'digital' },
  ]
  if (data.problems.includes('Losing customers to competitors')) {
    recs.push({ title: 'Conduct a competitor audit this week', description: `Visit or review the top 3 local competitors and document what they do better on price, presentation, and convenience. Then close the most visible gap.`, priority: 'high', category: 'marketing' })
  }
  if (data.problems.includes('Revenue has been declining')) {
    recs.push({ title: 'Introduce a loyalty or retention trigger', description: 'A stamp card, rebooking prompt, or 30-day follow-up email can lift repeat customer rate by 15–25% within 60 days.', priority: 'high', category: 'product' })
  }
  if (s.hours_opportunity) {
    recs.push({ title: 'Extend trading hours into the gap', description: 'Over half of local competitors are closed during key periods. One extra hour at peak demand is often worth more than two hours at quieter times.', priority: 'medium', category: 'product' })
  }
  recs.push({ title: 'Fix pricing architecture before expansion', description: `Build an anchor–core–premium tier matched to the local average (${priceLevelLabel(nearby?.avg_price_level ?? null)}). Then test a 5% price uplift on the least price-sensitive product.`, priority: 'medium', category: 'pricing' })
  recs.push({ title: 'Set a weekly revenue floor and track it', description: `${data.timeline ? `You want results in ${data.timeline}.` : ''} The fastest way is one number per week, tracked every Friday, with a single owner. No tracking = no turnaround.`, priority: 'high', category: 'product' })

  // ── Alternative locations (only relevant for expansion goal) ──────────────
  const alternatives: AlternativeLocation[] = data.owner_goal === 'Expand to a second location'
    ? [
        { name: `${data.suburb} — adjacent pocket`, suburb: data.suburb, postcode: data.postcode, score: Math.min(92, scores.success_score + 6), reason: `Same suburb brand recognition, potentially lower saturation 500m from current site` },
        { name: `${data.city || data.state} inner corridor`, score: Math.min(94, scores.success_score + 10), reason: `Higher foot traffic with fewer direct competitors — 20–35% higher rent offset by volume` },
        { name: 'Lower-saturation suburb nearby', score: Math.min(90, scores.success_score + 4), reason: 'Emerging suburb with same demographic but less established competition' },
      ]
    : []

  return {
    summary,
    whatsWorking,
    rootCauses,
    gapAnalysis,
    top5Fixes,
    threats,
    recs,
    roadmap,
    alternatives,
  }
}

// ── Fallback without OpenAI ───────────────────────────────────────────────────
export function buildExistingFallbackAnalysis(
  data: ExistingBusinessFormData,
  nearby: NearbyCompetitorData | null,
  scores: ScoringOutput
): AnalysisResult {
  const content = buildTurnaroundContent(data, nearby, scores)
  const isEstimated = !nearby || (nearby.source !== 'google' && nearby.source !== 'osm')
  const executiveSummary = `${data.business_name || data.business_type} shows a ${scores.current_health_score}/100 health score. The fastest turnaround path targets ${content.top5Fixes[0].slice(0, 80)}... Revenue recovery depends on closing the gap vs ${scores.signals.strong_competitors[0]?.name ?? 'leading local operators'}.`

  return {
    ...scores,
    executive_summary: executiveSummary,
    summary: content.summary,
    why_succeed: content.whatsWorking.slice(0, 4),
    why_fail: content.rootCauses.slice(0, 4),
    missing_elements: content.gapAnalysis.slice(0, 4),
    key_bottlenecks: content.rootCauses.slice(0, 4),
    fastest_growth_levers: content.top5Fixes.slice(0, 3),
    competitor_threats: content.threats,
    why_competitors_succeed: scores.signals.strong_competitors.slice(0, 3).map(c =>
      `${c.name} (${c.rating}★, ${c.review_count ?? '?'} reviews) wins on ${(c.rating ?? 0) >= 4.5 ? 'exceptional quality and trust' : 'consistency and local visibility'}`
    ).concat(scores.signals.strong_competitors.length === 0 ? ['Top operators in this category win on reviews, convenience, and digital visibility'] : []),
    best_differentiation: [
      scores.signals.hours_opportunity ? 'Extended trading hours — fill the gap competitors are leaving open' : 'Quality and service consistency — differentiate where ratings are weak locally',
      `Reviews and Google presence — accelerate to ${Math.max(50, scores.signals.competitor_count * 8)} reviews as fast as possible`,
      'Retention programme — repeat customers are 5× cheaper than acquiring new ones',
    ],
    best_underserved_niche: `${data.business_type} customers in ${data.suburb || data.state} who are currently served by ${scores.signals.weak_competitors.length > 0 ? 'poorly-rated operators' : 'inconsistent local options'} and want a more reliable alternative`,
    suggested_better_suburb: null,
    recommendations: content.recs,
    growth_opportunities: [
      `Fix ${data.problems[0] ?? 'the main underperformance driver'} first — that single change will unlock the most revenue`,
      scores.signals.delivery_gap ? 'Delivery and online ordering gap exists locally — capturing it doesn\'t require a new location' : 'Improve digital visibility before expanding fixed costs',
      data.owner_goal === 'Expand to a second location' ? 'Second site economics only make sense once the current site margin improves' : 'Focus on margin improvement before revenue growth',
    ],
    recommended_actions: content.recs.map(r => r.title),
    setup_checklist: [],
    setup_checklist_summary: '',
    what_to_fix_first: content.top5Fixes.slice(0, 4),
    how_to_improve_current_business: [
      'Compare pricing, product mix, and convenience against the highest-rated local competitor',
      'Use reviews and customer feedback to find the main service or product friction point',
      'Improve one growth lever at a time: reviews → pricing → retention → expansion',
    ],
    expansion_options: data.owner_goal === 'Expand to a second location'
      ? ['Open in a lower-saturation nearby suburb once current-site margins recover', 'Pilot delivery before physical expansion — lower capital risk', 'Validate second-site demand by surveying existing customers first']
      : ['Fix current-site economics before adding fixed costs', 'Test delivery or extended hours before a second lease', 'Revisit expansion after 90-day turnaround results are clear'],
    revenue_leakage_points: [
      data.problems.includes('Revenue has been declining') ? 'Revenue decline is likely driven by lost repeat customers — the least visible and most expensive form of leakage' : 'Pricing and basket size are the primary levers before new customer acquisition',
      'Inconsistent Google visibility means potential customers are choosing alternatives they can find faster',
    ],
    operational_bottlenecks: content.rootCauses.slice(0, 3),
    pricing_uplift_opportunities: [
      `Local market average is around ${priceLevelLabel(nearby?.avg_price_level ?? null)} — test a 5–8% price increase on the least price-sensitive product or service`,
      'Bundle and upsell architecture can lift average basket value without increasing customer acquisition cost',
    ],
    local_seo_google_review_weakness: [
      !data.google_maps_url ? 'Google Maps listing may not be fully claimed or optimised — this is likely the highest-ROI fix available' : 'Google listing exists but review velocity and freshness need attention',
      `Target ${Math.max(30, scores.signals.competitor_count * 8)} reviews to compete in local Maps ranking — start with a review request to existing customers this week`,
    ],
    delivery_radius_expansion_suggestion: [
      scores.signals.delivery_gap ? 'Delivery gap exists locally — pilot a small delivery zone before investing in a second physical site' : 'Delivery is already saturated locally — differentiate on speed or product instead',
    ],
    customer_retention_fixes: [
      'Launch a repeat-customer trigger: loyalty stamp, rebooking prompt, or follow-up SMS within 7 days of purchase',
      'Identify the top 20% of customers by frequency and design one offer specifically for them',
    ],
    repeat_customer_playbook: [
      'Send a thank-you message or offer to every customer within 48 hours of their visit',
      'Track weekly repeat rate and tie it to one staff member\'s responsibility',
      'Benchmark repeat rate against 35% — below that, retention is the main growth constraint',
    ],
    cost_reduction_opportunities: [
      'Review supplier terms — existing suppliers often offer better pricing to businesses that ask directly',
      data.staff_count > 5 ? 'Audit roster vs. revenue by trading hour — shift staff to peak times, reduce off-peak cover' : 'Fixed costs should stay below 30% of monthly revenue as a rule of thumb',
    ],
    staff_utilisation_issues: [
      data.staff_count > 3 ? 'Review whether current staff hours align with trading peaks and troughs' : 'Small team — focus on cross-skilling to reduce bottlenecks at peak times',
    ],
    supplier_dependency_risks: [
      'Avoid single-supplier dependency for any input that represents more than 20% of COGS',
    ],
    top_90_day_actions: content.top5Fixes,
    action_plan_30_day: content.top5Fixes.slice(0, 4),
    important_assumptions: [
      nearby ? `Competitor data is from ${nearby.source} and reflects businesses within ${nearby.search_radius_km}km of the selected suburb.` : 'Competitor data is estimated — suburb-level patterns used where live data is unavailable.',
      'Turnaround timeline assumes the main problem is operational, not structural — if the location has fundamentally changed (e.g. major anchor left), the timeline extends.',
      'Revenue recovery estimates assume existing customer relationships are still intact and can be reactivated.',
    ],
    section_sources: {
      nearby_competitors: isEstimated ? 'estimated' : 'real_data',
      market_gaps: isEstimated ? 'estimated' : 'real_data',
      recommendations: 'rules_based',
      setup_checklist: 'rules_based',
      growth_opportunities: isEstimated ? 'estimated' : 'real_data',
    },
    roadmap: content.roadmap,
    alternative_locations: content.alternatives,
    nearby_data: nearby,
  }
}

// ── OpenAI-powered turnaround analysis ────────────────────────────────────────
export async function generateExistingAnalysis(
  data: ExistingBusinessFormData,
  nearby: NearbyCompetitorData | null,
  scores: ScoringOutput
): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[openai-existing] No API key — using signal-driven fallback')
    return buildExistingFallbackAnalysis(data, nearby, scores)
  }

  const s = scores.signals
  const competitorLines = (nearby?.competitors ?? []).slice(0, 10).map((c, i) =>
    `${i + 1}. ${c.name} | ${c.address} | ${c.rating ?? 'no rating'}★ (${c.review_count ?? '?'} reviews) | price_level=${c.price_level ?? '?'}/4 | open=${c.open_now ?? '?'} | dist=${c.distance_km ?? '?'}km`
  ).join('\n')

  const signalBlock = `
PRE-CALCULATED SCORES (do NOT override):
current_health_score=${scores.current_health_score}
success_score=${scores.success_score}
competitor_saturation_score=${scores.competitor_saturation_score}
failure_risk_score=${scores.failure_risk_score}
opportunity_gap_score=${scores.opportunity_gap_score}

MARKET SIGNALS:
competitor_count=${s.competitor_count}
avg_competitor_rating=${s.avg_competitor_rating ?? 'unknown'}
weak_competitors=${s.weak_competitors.map(c => c.name).join(', ')}
strong_competitors=${s.strong_competitors.map(c => c.name).join(', ')}
price_gap=${s.price_gap}
hours_opportunity=${s.hours_opportunity}
delivery_gap=${s.delivery_gap}
density_per_sqkm=${s.density_per_sqkm}
data_source=${nearby?.source ?? 'none'}
`

  const prompt = `You are Australia's most experienced business turnaround analyst.

EXISTING BUSINESS INPUT:
- Business: ${data.business_name || data.business_type}
- Type: ${data.business_type}
- Location: ${data.suburb || 'Unknown suburb'}, ${data.state} ${data.postcode}
- Address: ${data.address || 'not provided'}
- Years operating: ${data.years_operating}
- Staff: ${data.staff_count}
- Monthly revenue: ${data.current_revenue || 'not stated'}
- Description: ${data.description || 'not provided'}
- Website: ${data.website_url || 'none'}
- Google Maps listing: ${data.google_maps_url || 'none'}
- Social handles: ${data.social_handles || 'none'}

PROBLEMS FLAGGED:
${data.problems.map(p => `- ${p}`).join('\n') || '- Not sure — need diagnosis'}

SITUATION:
${data.situation_description || 'Not described'}

WHAT HAS BEEN TRIED:
${data.what_tried || 'Not stated'}

OWNER GOAL:
${data.owner_goal || 'Fix and grow the existing business'}

CHANGE BUDGET:
${data.change_budget || 'not stated'}

RESULT TIMELINE:
${data.timeline || 'not stated'}

NEARBY COMPETITORS (live data):
${competitorLines || 'No competitor data available'}

${signalBlock}

TASK: Generate a turnaround-focused business intelligence report as a JSON object.
Do NOT write a feasibility report — this is an EXISTING BUSINESS that needs TURNAROUND ADVICE.

Focus on:
1. Root causes of underperformance vs nearby competitors
2. Competitor advantages this business is losing to
3. Gap analysis: what competitors offer that this business doesn't
4. Pricing diagnosis vs local market average
5. Top 5 things to fix in ROI order
6. 90-day turnaround roadmap (not a launch roadmap)
7. Whether to fix, pivot, or exit — with clear reasoning based on the data

Return ONLY valid JSON with this exact structure:
{
  "executive_summary": "2–3 sentence turnaround diagnosis",
  "summary": "1 paragraph situational summary",
  "why_succeed": ["What's working — array of 3–4 items"],
  "why_fail": ["Root causes of underperformance — array of 3–4 items"],
  "missing_elements": ["Gaps vs competitors — array of 3–4 items"],
  "key_bottlenecks": ["Top bottlenecks — array of 3–4 items"],
  "fastest_growth_levers": ["Top 3 fixes in ROI order"],
  "why_competitors_succeed": ["3 reasons nearby competitors win"],
  "best_differentiation": ["3–4 differentiation moves"],
  "best_underserved_niche": "one sentence",
  "top_90_day_actions": ["Fix 1", "Fix 2", "Fix 3", "Fix 4", "Fix 5"],
  "action_plan_30_day": ["Action 1", "Action 2", "Action 3"],
  "growth_opportunities": ["3 growth opportunities"],
  "revenue_leakage_points": ["2 revenue leakage points"],
  "operational_bottlenecks": ["2–3 bottlenecks"],
  "pricing_uplift_opportunities": ["2 pricing moves"],
  "local_seo_google_review_weakness": ["2 SEO/review items"],
  "customer_retention_fixes": ["2 retention fixes"],
  "repeat_customer_playbook": ["3 retention steps"],
  "cost_reduction_opportunities": ["2 cost items"],
  "what_to_fix_first": ["4 ordered fixes"],
  "how_to_improve_current_business": ["3 improvement steps"],
  "expansion_options": ["3 expansion paths"],
  "roadmap": [
    { "period": "Week 1–2", "title": "...", "tasks": ["task1", "task2", "task3"] },
    { "period": "Week 3–4", "title": "...", "tasks": ["task1", "task2", "task3"] },
    { "period": "Month 2", "title": "...", "tasks": ["task1", "task2", "task3"] },
    { "period": "Month 3", "title": "...", "tasks": ["task1", "task2", "task3"] }
  ],
  "important_assumptions": ["2–3 assumptions"]
}`

  try {
    const client = getClient()
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 3000,
    })

    const raw = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)

    const fallback = buildExistingFallbackAnalysis(data, nearby, scores)

    return {
      ...fallback,
      executive_summary: parsed.executive_summary || fallback.executive_summary,
      summary: parsed.summary || fallback.summary,
      why_succeed: parsed.why_succeed?.length ? parsed.why_succeed : fallback.why_succeed,
      why_fail: parsed.why_fail?.length ? parsed.why_fail : fallback.why_fail,
      missing_elements: parsed.missing_elements?.length ? parsed.missing_elements : fallback.missing_elements,
      key_bottlenecks: parsed.key_bottlenecks?.length ? parsed.key_bottlenecks : fallback.key_bottlenecks,
      fastest_growth_levers: parsed.fastest_growth_levers?.length ? parsed.fastest_growth_levers : fallback.fastest_growth_levers,
      why_competitors_succeed: parsed.why_competitors_succeed?.length ? parsed.why_competitors_succeed : fallback.why_competitors_succeed,
      best_differentiation: parsed.best_differentiation?.length ? parsed.best_differentiation : fallback.best_differentiation,
      best_underserved_niche: parsed.best_underserved_niche || fallback.best_underserved_niche,
      top_90_day_actions: parsed.top_90_day_actions?.length ? parsed.top_90_day_actions : fallback.top_90_day_actions,
      action_plan_30_day: parsed.action_plan_30_day?.length ? parsed.action_plan_30_day : fallback.action_plan_30_day,
      growth_opportunities: parsed.growth_opportunities?.length ? parsed.growth_opportunities : fallback.growth_opportunities,
      revenue_leakage_points: parsed.revenue_leakage_points?.length ? parsed.revenue_leakage_points : fallback.revenue_leakage_points,
      operational_bottlenecks: parsed.operational_bottlenecks?.length ? parsed.operational_bottlenecks : fallback.operational_bottlenecks,
      pricing_uplift_opportunities: parsed.pricing_uplift_opportunities?.length ? parsed.pricing_uplift_opportunities : fallback.pricing_uplift_opportunities,
      local_seo_google_review_weakness: parsed.local_seo_google_review_weakness?.length ? parsed.local_seo_google_review_weakness : fallback.local_seo_google_review_weakness,
      customer_retention_fixes: parsed.customer_retention_fixes?.length ? parsed.customer_retention_fixes : fallback.customer_retention_fixes,
      repeat_customer_playbook: parsed.repeat_customer_playbook?.length ? parsed.repeat_customer_playbook : fallback.repeat_customer_playbook,
      cost_reduction_opportunities: parsed.cost_reduction_opportunities?.length ? parsed.cost_reduction_opportunities : fallback.cost_reduction_opportunities,
      what_to_fix_first: parsed.what_to_fix_first?.length ? parsed.what_to_fix_first : fallback.what_to_fix_first,
      how_to_improve_current_business: parsed.how_to_improve_current_business?.length ? parsed.how_to_improve_current_business : fallback.how_to_improve_current_business,
      expansion_options: parsed.expansion_options?.length ? parsed.expansion_options : fallback.expansion_options,
      roadmap: (parsed.roadmap?.length ? parsed.roadmap : fallback.roadmap) as RoadmapWeek[],
      important_assumptions: parsed.important_assumptions?.length ? parsed.important_assumptions : fallback.important_assumptions,
    }
  } catch (err) {
    console.error('[openai-existing] OpenAI error, falling back:', err)
    return buildExistingFallbackAnalysis(data, nearby, scores)
  }
}
