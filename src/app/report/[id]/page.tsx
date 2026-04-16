'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, MapPin, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronRight, Building2 } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import type { Report, AnalysisResult } from '@/types'
import { safeScore, scoreColor, scoreBarColor, scoreLabel, riskLabel, riskColor } from '@/lib/utils'
import { NearbyCompetitors } from '@/components/report/NearbyCompetitors'
import { OpportunityGap } from '@/components/report/OpportunityGap'
import { CompetitorMap } from '@/components/report/CompetitorMap'
import { TopCompetitors } from '@/components/report/TopCompetitors'
import { CompetitorInsights } from '@/components/report/CompetitorInsights'
import { AlternativeLocations } from '@/components/report/AlternativeLocation'

const TEMP_REPORT_KEY = 'globalbiz_temp_report'

type Tab = 'overview' | 'map' | 'competitors' | 'insights' | 'opportunity' | 'roadmap' | 'locations'

function ScoreMeter({ label, score, delay = 0, insight }: { label: string; score: number; delay?: number; insight?: string }) {
  const [animated, setAnimated] = useState(false)
  const safe = safeScore(score)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), delay); return () => clearTimeout(t) }, [delay])

  const statusTone = safe >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : safe >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className="ui-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wide leading-tight">{label}</span>
          <div className="mt-1 text-3xl font-display font-bold text-slate-900">{safe}%</div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone}`}>
          {scoreLabel(safe)}
        </span>
      </div>
      <div className="mb-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(safe)}`}
          style={{ width: animated ? `${safe}%` : '0%' }} />
      </div>
      <div className="text-xs text-slate-500">
        {insight ?? `${safe}/100`}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {[48, 96, 320, 192, 240].map(h => (
          <div key={h} className="skeleton rounded-xl" style={{ height: h }} />
        ))}
      </div>
    </div>
  )
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [report,       setReport]       = useState<Report | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState<Tab>('overview')
  const [error,        setError]        = useState<string | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const cached = sessionStorage.getItem(`${TEMP_REPORT_KEY}_${id}`)
        if (cached) {
          const parsed = JSON.parse(cached) as Report
          if (parsed?.analysis?.success_score !== undefined) { setReport(parsed); setLoading(false); return }
        }
      } catch {}
      try {
        const res = await fetch(`/api/report/${id}`)
        const ct = res.headers.get('content-type') ?? ''
        if (!ct.includes('application/json')) { setError(`Server error (${res.status})`); return }
        const d = await res.json()
        if (!res.ok || d.error) setError(d.error ?? 'Report not found')
        else setReport(d as Report)
      } catch (err) {
        setError('Failed to load report.')
        console.error('[report]', err)
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const safeReport = report
  const a: AnalysisResult = (safeReport?.analysis ?? {
    success_score: 0,
    decision_confidence_score: 0,
    business_viability_score: 0,
    differentiation_score: 0,
    suburb_opportunity_score: 0,
    pricing_confidence_score: 0,
    customer_retention_strength_score: 0,
    expansion_readiness_score: 0,
    digital_acquisition_strength_score: 0,
    current_health_score: 0,
    digital_maturity_score: 0,
    retention_risk_score: 0,
    social_media_opportunity_score: 0,
    seo_gap_score: 0,
    second_branch_readiness_score: 0,
    delivery_expansion_readiness_score: 0,
    customer_lifetime_score: 0,
    local_brand_strength_score: 0,
    cultural_fit_score: 0,
    competitor_saturation_score: 0,
    pricing_fit_score: 0,
    failure_risk_score: 0,
    opportunity_gap_score: 0,
    demand_probability_score: 0,
    break_even_months: 0,
    executive_summary: '',
    summary: '',
    why_succeed: [],
    why_fail: [],
    missing_elements: [],
    key_bottlenecks: [],
    opportunity_highlights: [],
    fastest_growth_levers: [],
    competitor_threats: [],
    why_competitors_succeed: [],
    best_differentiation: [],
    best_underserved_niche: '',
    suggested_better_suburb: null,
    recommendations: [],
    growth_opportunities: [],
    recommended_actions: [],
    setup_checklist: [],
    setup_checklist_summary: '',
    what_to_fix_first: [],
    how_to_improve_current_business: [],
    expansion_options: [],
    revenue_leakage_points: [],
    operational_bottlenecks: [],
    pricing_uplift_opportunities: [],
    local_seo_google_review_weakness: [],
    delivery_radius_expansion_suggestion: [],
    customer_retention_fixes: [],
    repeat_customer_playbook: [],
    cost_reduction_opportunities: [],
    staff_utilisation_issues: [],
    supplier_dependency_risks: [],
    top_90_day_actions: [],
    action_plan_30_day: [],
    important_assumptions: [],
    section_sources: {
      nearby_competitors: 'estimated',
      market_gaps: 'estimated',
      recommendations: 'estimated',
      setup_checklist: 'rules_based',
      growth_opportunities: 'estimated',
    },
    roadmap: [],
    alternative_locations: [],
    nearby_data: null,
  }) as AnalysisResult
  const viabilityScore = safeScore(a.business_viability_score ?? a.success_score)
  const confidenceScore = safeScore(a.decision_confidence_score ?? a.success_score)
  const currentHealthScore = safeScore(a.current_health_score ?? 60)
  const digitalMaturityScore = safeScore(a.digital_maturity_score ?? 50)
  const differentiationScore = safeScore(a.differentiation_score ?? a.opportunity_gap_score ?? 50)
  const suburbOpportunityScore = safeScore(a.suburb_opportunity_score ?? a.opportunity_gap_score ?? 50)
  const pricingFitScore = safeScore(a.pricing_fit_score)
  const radarData = [
    { subject: 'Success',     value: safeScore(a.success_score) },
    { subject: 'Cultural',    value: safeScore(a.cultural_fit_score) },
    { subject: 'Pricing',     value: pricingFitScore },
    { subject: 'Opportunity', value: safeScore(a.opportunity_gap_score ?? 50) },
    { subject: 'Safety',      value: safeScore(100 - safeScore(a.failure_risk_score)) },
    { subject: 'Market',      value: safeScore(100 - safeScore(a.competitor_saturation_score)) },
  ]

  // Fallback: extract lat/lng from analysis if not on report root
  const reportLat = ((safeReport as unknown as Record<string,unknown> | null)?.lat as number | null | undefined) ?? null
  const reportLng = ((safeReport as unknown as Record<string,unknown> | null)?.lng as number | null | undefined) ?? null

  const nearbyCompetitorData = {
    source: a.nearby_data?.source ?? 'google',
    total_found: a.nearby_data?.total_found ?? report?.competitor_stats?.total ?? 0,
    strong_count: a.nearby_data?.strong_count ?? report?.competitor_stats?.strong ?? 0,
    moderate_count: a.nearby_data?.moderate_count ?? report?.competitor_stats?.moderate ?? 0,
    weak_count: a.nearby_data?.weak_count ?? report?.competitor_stats?.weak ?? 0,
    avg_rating: a.nearby_data?.avg_rating ?? report?.competitor_stats?.avg_rating ?? null,
    avg_price_level: a.nearby_data?.avg_price_level ?? null,
    competitor_density: a.nearby_data?.competitor_density ?? report?.competitor_stats?.density ?? 'low',
    search_radius_km: a.nearby_data?.search_radius_km ?? safeReport?.radius_km ?? 3,
    competitors: a.nearby_data?.competitors ?? report?.competitors ?? [],
    shopping_center_anchors: a.nearby_data?.shopping_center_anchors ?? [],
    food_hotspots: a.nearby_data?.food_hotspots ?? [],
    local_retail_clusters: a.nearby_data?.local_retail_clusters ?? [],
  }

  const competitorMapProps = {
    lat: reportLat ?? -33.8688,
    lng: reportLng ?? 151.2093,
    radiusKm: nearbyCompetitorData.search_radius_km ?? safeReport?.radius_km ?? 3,
    competitors: nearbyCompetitorData.competitors,
    suburb: safeReport?.suburb || safeReport?.state || 'Australia',
    businessType: safeReport?.business_type || '',
  }

  const hasMap = !!(a.nearby_data && (safeReport as unknown as Record<string,unknown> | null)?.lat)

  type TabDef = { id: Tab; label: string; badge?: number | string }
  const tabs: TabDef[] = [
    { id: 'overview',     label: 'Overview' },
    { id: 'map',          label: 'Map', badge: nearbyCompetitorData.total_found },
    { id: 'competitors',  label: 'Competitors' },
    { id: 'insights',     label: 'Insights' },
    { id: 'opportunity',  label: 'Opportunity' },
    { id: 'roadmap',      label: 'Roadmap' },
    { id: 'locations',    label: 'Locations' },
  ]

  const locationLine = [safeReport?.suburb, safeReport?.city, safeReport?.state].filter(Boolean).join(', ')
  const sourceLabel = nearbyCompetitorData.source === 'google' ? 'Google Maps' : nearbyCompetitorData.source === 'osm' ? 'OpenStreetMap' : 'Estimated'
  const isExistingReport = (safeReport as unknown as Record<string, unknown>)?.report_type === 'existing'
  const goalLabel = isExistingReport ? 'Turnaround report' : safeReport?.user_goal_mode === 'grow_existing' ? 'Growth report' : 'New business report'
  const operatingHours = safeReport?.operating_hours || 'Not provided'
  const sourceBadge = (label?: string) => {
    if (label === 'real_data') return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Real data</span>
    if (label === 'rules_based') return <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-700">Rules based</span>
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Estimated insight</span>
  }

  if (loading) return <Skeleton />
  if (error || !report) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center px-6">
      <div>
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-display font-bold text-slate-900 mb-2">Report not found</h1>
        <p className="text-slate-500 mb-6">{error ?? 'This report may have expired.'}</p>
        <Link href="/analyze" className="bg-brand-500 text-white px-6 py-3 rounded-xl text-sm font-medium">Generate new report</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Nav */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
          <ArrowLeft size={16} /> Home
        </Link>
        <span className="font-display font-bold text-slate-900 text-sm">GlobalBiz <span className="text-brand-500">AI</span></span>
        <div className="flex items-center gap-2">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}) }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
            <Share2 size={13} /> Share
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs bg-brand-500/15 text-brand-400 border border-brand-500/30 hover:bg-brand-500/25 px-3 py-1.5 rounded-lg transition-all">
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="fade-up fade-up-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
            <MapPin size={12} /><span>{locationLine || 'Australia'}</span>
            <span className="w-1 h-1 rounded-full bg-[#2a3040]" />
            <Building2 size={12} /><span>{report.business_type}</span>
            <span className="w-1 h-1 rounded-full bg-[#2a3040]" />
            <span>{goalLabel}</span>
            <span className="w-1 h-1 rounded-full bg-[#2a3040]" />
            <span>{new Date(report.created_at).toLocaleDateString('en-AU')}</span>
            {a.nearby_data && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-brand-500">{a.nearby_data.total_found} real competitors · {sourceLabel}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">
            {isExistingReport ? 'Business turnaround report' : 'Australia business growth intelligence report'}
          </h1>
          {isExistingReport && (safeReport as unknown as Record<string, unknown>)?.business_name && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 shadow-sm">
              <Building2 size={14} className="text-emerald-500" />
              {String((safeReport as unknown as Record<string, unknown>).business_name)}
            </div>
          )}
          <div className="mb-3">{sourceBadge(a.section_sources?.nearby_competitors)}</div>
          <p className="text-slate-600 leading-relaxed max-w-2xl">{a.executive_summary || a.summary}</p>
        </div>

        {/* Hero score */}
        <div className="fade-up fade-up-2 ui-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Overall viability</div>
              <div className={`text-7xl font-display font-bold ${scoreColor(viabilityScore)}`}>{viabilityScore}%</div>
              <div className={`text-base font-medium mt-1 ${scoreColor(viabilityScore)}`}>{scoreLabel(viabilityScore)}</div>
              {a.nearby_data && (
                <div className="text-xs text-slate-500 mt-2">{a.nearby_data.total_found} competitors · {a.nearby_data.competitor_density} density</div>
              )}
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.3)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5568', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Score grid */}
        <div className="fade-up fade-up-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ScoreMeter label="Business viability" score={viabilityScore} delay={25} insight="Overall investability for this path" />
          <ScoreMeter label="Decision confidence" score={confidenceScore} delay={40} insight="How reliable the recommendation is" />
          <ScoreMeter label="Current health" score={currentHealthScore} delay={50} insight="Current operating baseline" />
          <ScoreMeter label="Digital maturity" score={digitalMaturityScore} delay={75} insight="Website, profile, and channel quality" />
          <ScoreMeter label="Differentiation" score={differentiationScore} delay={90} insight="How clearly you can stand out" />
          <ScoreMeter label="Cultural fit" score={safeScore(a.cultural_fit_score)} delay={100} insight="Audience and suburb alignment" />
          <ScoreMeter label="Suburb opportunity" score={suburbOpportunityScore} delay={120} insight="Local upside in this catchment" />
          <ScoreMeter label="Pricing fit" score={pricingFitScore} delay={200} insight="Price point alignment with the market" />
          <ScoreMeter label="Pricing confidence" score={safeScore(a.pricing_confidence_score ?? a.pricing_fit_score)} delay={240} insight="How believable the pricing path is" />
          <ScoreMeter label="Opportunity gap" score={safeScore(a.opportunity_gap_score ?? 50)} delay={300} insight="Available whitespace in the market" />
          <ScoreMeter label="Demand" score={safeScore(a.demand_probability_score ?? 60)} delay={400} insight="Likely customer demand strength" />
          <ScoreMeter label="Retention strength" score={safeScore(a.customer_retention_strength_score ?? 50)} delay={430} insight="Repeat customer potential" />
          <ScoreMeter label="Branch readiness" score={safeScore(a.second_branch_readiness_score ?? 45)} delay={450} insight="Readiness for a second site" />
          <ScoreMeter label="Delivery readiness" score={safeScore(a.delivery_expansion_readiness_score ?? 45)} delay={500} insight="Operational readiness for wider coverage" />
          <ScoreMeter label="Expansion readiness" score={safeScore(a.expansion_readiness_score ?? 45)} delay={520} insight="Overall ability to scale safely" />
          <ScoreMeter label="Brand strength" score={safeScore(a.local_brand_strength_score ?? 50)} delay={550} insight="Local trust and recall" />
          <ScoreMeter label="Digital acquisition" score={safeScore(a.digital_acquisition_strength_score ?? 50)} delay={575} insight="Ability to attract demand online" />
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Retention risk</div>
            <div className={`text-2xl font-display font-bold ${riskColor(safeScore(a.retention_risk_score ?? 50))}`}>{riskLabel(safeScore(a.retention_risk_score ?? 50))}</div>
            <div className="text-xs text-slate-500 mt-1">{safeScore(a.retention_risk_score ?? 50)}/100</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">SEO gap</div>
            <div className="text-2xl font-display font-bold text-amber-500">{safeScore(a.seo_gap_score ?? 45)}%</div>
            <div className="text-xs text-slate-500 mt-1">/100 gap</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Customer lifetime</div>
            <div className="text-2xl font-display font-bold text-emerald-500">{safeScore(a.customer_lifetime_score ?? 50)}%</div>
            <div className="text-xs text-slate-500 mt-1">/100 quality</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Social opportunity</div>
            <div className="text-2xl font-display font-bold text-emerald-500">{safeScore(a.social_media_opportunity_score ?? 50)}%</div>
            <div className="text-xs text-slate-500 mt-1">/100 upside</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Failure risk</div>
            <div className={`text-2xl font-display font-bold ${riskColor(safeScore(a.failure_risk_score))}`}>{riskLabel(safeScore(a.failure_risk_score))}</div>
            <div className="text-xs text-slate-500 mt-1">{safeScore(a.failure_risk_score)}/100</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Break-even</div>
            <div className="text-2xl font-display font-bold text-slate-900">{Number.isFinite(a.break_even_months) ? a.break_even_months : 0}</div>
            <div className="text-xs text-slate-500 mt-1">months</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Competitors</div>
            <div className={`text-2xl font-display font-bold ${scoreColor(safeScore(100 - safeScore(a.competitor_saturation_score)))}`}>
              {a.nearby_data?.total_found ?? '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">{a.nearby_data ? `${a.nearby_data.competitor_density}` : 'estimated'}</div>
          </div>
          <div className="ui-card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Saturation</div>
            <div className={`text-2xl font-display font-bold ${scoreColor(safeScore(100 - safeScore(a.competitor_saturation_score)))}`}>{safeScore(a.competitor_saturation_score)}%</div>
            <div className="text-xs text-slate-500 mt-1">/100</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5
                ${activeTab === t.id ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              {t.label}
              {t.badge !== undefined && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full leading-none">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 fade-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="ui-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="font-display font-semibold text-slate-900 text-sm">
                    {isExistingReport ? "What's working" : 'Executive summary'}
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">{a.summary}</p>
                <ul className="space-y-2">
                  {a.why_succeed?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ui-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="font-display font-semibold text-slate-900 text-sm">
                    {isExistingReport ? 'Root causes of underperformance' : 'Key bottlenecks'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {(a.key_bottlenecks?.length ? a.key_bottlenecks : a.why_fail)?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {a.fastest_growth_levers?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="font-display font-semibold text-slate-900 text-sm">Fastest growth levers</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {a.fastest_growth_levers.map((item, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.user_goal_mode === 'start_new' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Founder setup snapshot</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Price range</div>
                      <div className="mt-1 text-sm text-slate-900">{report.avg_price_range || 'Not provided'}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Competitor radius</div>
                      <div className="mt-1 text-sm text-slate-900">{report.radius_km ?? a.nearby_data?.search_radius_km ?? 0}km</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Operating hours</div>
                      <div className="mt-1 text-sm text-slate-900">{operatingHours}</div>
                    </div>
                    {a.nearby_data?.shopping_center_anchors?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Shopping centre anchors</div>
                        <div className="mt-1 text-sm text-slate-900">{a.nearby_data.shopping_center_anchors.slice(0, 4).join(', ')}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Timing and whitespace signals</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">•</span>
                      Break-even estimate: {Number.isFinite(a.break_even_months) ? a.break_even_months : 0} months.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">•</span>
                      Local density: {a.nearby_data?.competitor_density ?? 'estimated'} with {a.nearby_data?.total_found ?? 0} nearby businesses.
                    </li>
                    {a.nearby_data?.food_hotspots?.length ? (
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>
                        Food hotspots nearby: {a.nearby_data.food_hotspots.slice(0, 3).join(', ')}.
                      </li>
                    ) : null}
                    {a.nearby_data?.local_retail_clusters?.length ? (
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>
                        Retail cluster signals: {a.nearby_data.local_retail_clusters.slice(0, 3).join(', ')}.
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            )}

            {a.missing_elements?.length > 0 && (
              <div className="ui-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="font-display font-semibold text-slate-900 text-sm">Important assumptions and gaps</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {a.missing_elements.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
                      <span className="text-amber-600 mt-0.5 flex-shrink-0">→</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {a.recommendations?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <span className="font-display font-semibold text-slate-900 text-sm">Recommended actions</span>
                  </div>
                  {sourceBadge(a.section_sources?.recommendations)}
                </div>
                <div className="space-y-3">
                  {a.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5
                        ${r.priority === 'high' ? 'bg-amber-50 text-amber-700' :
                          r.priority === 'medium' ? 'bg-sky-50 text-sky-700' :
                          'bg-emerald-50 text-emerald-700'}`}>{r.priority}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-900 mb-0.5">{r.title}</div>
                        <div className="text-xs text-slate-500">{r.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {a.why_competitors_succeed?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="font-display font-semibold text-slate-900 text-sm">Why competitors in this area succeed</span>
                  {sourceBadge(a.section_sources?.nearby_competitors)}
                </div>
                <ul className="space-y-2">
                  {a.why_competitors_succeed.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.growth_opportunities?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-slate-900 text-sm">Growth opportunities</span>
                  {sourceBadge(a.section_sources?.growth_opportunities)}
                </div>
                <ul className="space-y-2">
                  {a.growth_opportunities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">↗</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.setup_checklist?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="font-display font-semibold text-slate-900 text-sm">Australian setup & permits checklist</span>
                  {sourceBadge(a.section_sources?.setup_checklist)}
                </div>
                <div className="space-y-4">
                  {a.setup_checklist.map((section, index) => (
                    <div key={index}>
                      <div className="mb-2 text-sm font-medium text-slate-900">{section.title}</div>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-0.5 text-emerald-500">✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.user_goal_mode === 'grow_existing' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Top 3 risks</div>
                  <ul className="space-y-2">
                    {a.what_to_fix_first?.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-amber-500">{i + 1}</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Fastest growth lever</div>
                  <ul className="space-y-2">
                    {a.how_to_improve_current_business?.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">→</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {a.expansion_options?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-3 font-display text-sm font-semibold text-slate-900">Expansion scenario suggestions</div>
                <ul className="space-y-2">
                  {a.expansion_options.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-emerald-500">+</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.top_90_day_actions?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-3 font-display text-sm font-semibold text-slate-900">30-day action plan</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(a.action_plan_30_day?.length ? a.action_plan_30_day : a.top_90_day_actions).map((item, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Action {i + 1}</div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {a.important_assumptions?.length > 0 && (
              <div className="ui-card p-5">
                <div className="mb-3 font-display text-sm font-semibold text-slate-900">Important assumptions</div>
                <ul className="space-y-2">
                  {a.important_assumptions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-sky-600">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.user_goal_mode === 'grow_existing' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Revenue leakage points</div>
                  <ul className="space-y-2">
                    {a.revenue_leakage_points?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-red-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Operational bottlenecks</div>
                  <ul className="space-y-2">
                    {a.operational_bottlenecks?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-amber-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Pricing uplift opportunities</div>
                  <ul className="space-y-2">
                    {a.pricing_uplift_opportunities?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Local SEO / Google review weakness</div>
                  <ul className="space-y-2">
                    {a.local_seo_google_review_weakness?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-sky-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Delivery radius expansion</div>
                  <ul className="space-y-2">
                    {a.delivery_radius_expansion_suggestion?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-sky-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Customer retention fixes</div>
                  <ul className="space-y-2">
                    {a.customer_retention_fixes?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Repeat customer playbook</div>
                  <ul className="space-y-2">
                    {a.repeat_customer_playbook?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Cost reduction opportunities</div>
                  <ul className="space-y-2">
                    {a.cost_reduction_opportunities?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-emerald-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Staff utilisation issues</div>
                  <ul className="space-y-2">
                    {a.staff_utilisation_issues?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-amber-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ui-card p-5">
                  <div className="mb-3 font-display text-sm font-semibold text-slate-900">Supplier dependency risks</div>
                  <ul className="space-y-2">
                    {a.supplier_dependency_risks?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-amber-500">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Map ── */}
        {activeTab === 'map' && (
          <div className="fade-up space-y-4">
            {(nearbyCompetitorData.total_found > 0 || reportLat || report.suburb) ? (
              <>
                <CompetitorMap
                  {...competitorMapProps}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="ui-card p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Strong competitors</div>
                    <div className="mt-1 text-2xl font-display font-bold text-amber-600">{nearbyCompetitorData.strong_count ?? 0}</div>
                  </div>
                  <div className="ui-card p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Moderate competitors</div>
                    <div className="mt-1 text-2xl font-display font-bold text-sky-600">{nearbyCompetitorData.moderate_count ?? 0}</div>
                  </div>
                  <div className="ui-card p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Weak under 3.8</div>
                    <div className="mt-1 text-2xl font-display font-bold text-emerald-600">{nearbyCompetitorData.weak_count ?? 0}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="ui-card p-8 text-center">
                <p className="text-slate-500 text-sm">Loading competitor map...</p>
              </div>
            )}
            <NearbyCompetitors nearby={nearbyCompetitorData} threats={a.competitor_threats ?? []} />
          </div>
        )}

        {/* ── Competitors ── */}
        {activeTab === 'competitors' && (
          <div className="fade-up">
            {nearbyCompetitorData.competitors.length > 0 ? (
              <div className="space-y-3">
                <div>{sourceBadge(a.section_sources?.nearby_competitors)}</div>
                <TopCompetitors competitors={nearbyCompetitorData.competitors} radiusKm={nearbyCompetitorData.search_radius_km} />
              </div>
            ) : (
              <div className="ui-card p-8 text-center text-slate-500 text-sm">No competitor data available.</div>
            )}
          </div>
        )}

        {/* ── Insights ── */}
        {activeTab === 'insights' && (
          <div className="fade-up">
            {nearbyCompetitorData.competitors.length > 0 || nearbyCompetitorData.total_found >= 0 ? (
              <div className="space-y-3">
                <div>{sourceBadge(a.section_sources?.market_gaps)}</div>
                <CompetitorInsights nearby={nearbyCompetitorData} />
              </div>
            ) : (
              <div className="ui-card p-8 text-center text-slate-500 text-sm">No competitor data to analyse.</div>
            )}
          </div>
        )}

        {/* ── Opportunity ── */}
        {activeTab === 'opportunity' && (
          <div className="fade-up">
            <OpportunityGap analysis={a} />
          </div>
        )}

        {/* ── Roadmap ── */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4 fade-up">
            {isExistingReport && (
              <div className="mb-2">
                <h2 className="font-display text-xl font-bold text-slate-900">90-day turnaround plan</h2>
                <p className="mt-1 text-sm text-slate-500">Ordered by ROI impact — fix the first milestone before moving to the next.</p>
              </div>
            )}
            {a.roadmap?.map((week, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < (a.roadmap?.length ?? 0) - 1 && <div className="flex-1 w-px bg-slate-200 mt-2" />}
                </div>
                <div className="ui-card p-5 flex-1 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{week.period}</span>
                    <span className="font-display font-semibold text-slate-900 text-sm">{week.title}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {week.tasks?.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />{task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Locations ── */}
        {activeTab === 'locations' && (
          <div className="fade-up">
            <AlternativeLocations
              locations={a.alternative_locations ?? []}
              currentSuburb={report.suburb || 'Your location'}
              currentScore={a.success_score}
            />
          </div>
        )}

        {/* Feedback */}
        <div className="ui-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-900">
              {feedbackSent ? 'Thanks for your feedback!' : 'Was this report useful?'}
            </span>
          </div>
          {!feedbackSent && (
            <div className="flex flex-wrap gap-2">
              {['Very useful', 'Somewhat useful', 'Needs improvement'].map(opt => (
                <button key={opt}
                  onClick={() => {
                    fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ report_id: id, useful: opt === 'Very useful', comment: opt }) }).catch(() => {})
                    setFeedbackSent(true)
                  }}
                  className="text-xs border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 px-4 py-2 rounded-lg transition-all">
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-8">
          <Link href="/analyze" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
            Analyse another business <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}
