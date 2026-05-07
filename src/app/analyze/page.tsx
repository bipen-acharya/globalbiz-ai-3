'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Globe,
  Loader2,
  MapPin,
} from 'lucide-react'
import { AddressPicker } from '@/components/AddressPicker'
import type { PlaceResult } from '@/components/AddressPicker'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMP_REPORT_KEY = 'globalbiz_temp_report'

const TEAM_SIZE_OPTIONS = ['Solo', '2–5', '6–20', '20+'] as const
const LAUNCH_OPTIONS    = ['Within 3 months', '3–6 months', '6–12 months', '1+ year'] as const
const BUDGET_OPTIONS    = ['Under $5K', '$5K–$20K', '$20K–$50K', '$50K–$100K', '$100K+'] as const
const PRICE_OPTIONS     = ['Under $15', '$15–$50', '$50–$150', '$150–$500', '$500+', 'Custom quote'] as const
const RADIUS_OPTIONS    = [5, 10, 20, 50] as const

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const

const BUSINESS_CATEGORIES = [
  'Café / Coffee shop', 'Restaurant / Takeaway', 'Bakery', 'Bar / Pub', 'Food truck',
  'Retail store', 'Online store / eCommerce', 'Clothing & fashion', 'Grocery / Supermarket',
  'Beauty salon / Barber', 'Gym / Fitness studio', 'Health & wellness', 'Medical / Allied health',
  'Childcare / Education', 'Real estate', 'Cleaning services', 'Trades / Handyman',
  'IT services / Software', 'Marketing / Agency', 'Accounting / Finance',
  'Legal services', 'Consulting', 'Others',
] as const

const TARGET_CUSTOMER_OPTIONS = [
  'Students', 'Families', 'Professionals', 'Tourists', 'Seniors',
  'Local residents', 'Online customers', 'Businesses (B2B)', 'Other',
] as const

const LOADING_STAGES = [
  { label: 'Scanning competitors…',      sub: 'Pulling real Google Maps data and competitor signals.' },
  { label: 'Analysing demand…',          sub: 'Measuring market demand, audience fit, and market gaps.' },
  { label: 'Generating insights…',       sub: 'Scoring viability, differentiation, and expansion readiness.' },
  { label: 'Building your action plan…', sub: 'Adding Australian setup, permits, and 90-day guidance.' },
]

function budgetToNumber(b: string): number {
  const map: Record<string, number> = {
    'Under $5K': 4000, '$5K–$20K': 12000, '$20K–$50K': 35000,
    '$50K–$100K': 75000, '$100K+': 150000,
  }
  return map[b] ?? 10000
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BusinessType = 'physical' | 'online'
type Errors = Record<string, string>

interface FormState {
  businessName:        string
  description:         string
  businessType:        BusinessType
  businessCategory:    string
  customBusinessType:  string
  // Physical — Google Maps address picker
  place:               PlaceResult | null
  radiusKm:            number
  // Online
  websiteUrl:          string
  googleBizUrl:        string
  country:             string
  onlineState:         string
  // Common
  targetCustomers:     string[]
  customTargetCustomer: string
  teamSize:            string
  launchTimeframe:     string
  budgetRange:         string
  avgPriceRange:       string
}

const DEFAULT_FORM: FormState = {
  businessName:        '',
  description:         '',
  businessType:        'physical',
  businessCategory:    '',
  customBusinessType:  '',
  place:               null,
  radiusKm:            10,
  websiteUrl:          '',
  googleBizUrl:        '',
  country:             'Australia',
  onlineState:         'NSW',
  targetCustomers:     [],
  customTargetCustomer: '',
  teamSize:            'Solo',
  launchTimeframe:     '3–6 months',
  budgetRange:         '$5K–$20K',
  avgPriceRange:       '$15–$50',
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, LOADING_STAGES.length - 1)), 2500)
    return () => clearInterval(t)
  }, [])
  const stage = LOADING_STAGES[idx]
  return (
    <div className="loading-overlay">
      <div className="mb-8 text-center">
        <div className="mb-6 mx-auto w-12 h-12 loading-spinner" />
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">{stage.label}</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">{stage.sub}</p>
      </div>
      <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="loading-progress-bar h-full rounded-full" />
      </div>
      <p className="mt-4 text-xs text-slate-400">This takes 10–20 seconds</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const router = useRouter()

  const [form,        setForm]        = useState<FormState>(DEFAULT_FORM)
  const [errors,      setErrors]      = useState<Errors>({})
  const [submitting,  setSubmitting]  = useState(false)
  const [scraping,    setScraping]    = useState(false)
  const [scrapeBanner, setScrapeBanner] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  // ── Website scraping on blur ──────────────────────────────────────────────
  async function handleWebsiteBlur() {
    if (!form.websiteUrl.trim() || scraping) return
    setScraping(true)
    try {
      const res = await fetch('/api/scrape-website', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: form.websiteUrl }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        const d = data.data
        setForm(f => ({
          ...f,
          businessName:     f.businessName     || d.businessName     || f.businessName,
          description:      f.description      || d.description      || f.description,
          businessCategory: f.businessCategory || d.category         || f.businessCategory,
        }))
        setScrapeBanner(true)
      }
    } catch {}
    setScraping(false)
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): Errors {
    const e: Errors = {}
    if (!form.businessCategory) e.businessCategory = 'Choose a business category.'
    if (form.businessCategory === 'Others' && !form.customBusinessType.trim())
      e.customBusinessType = 'Please specify your business type.'
    if (!form.description.trim()) e.description = 'Add a short description.'
    if (form.businessType === 'physical' && !form.place)
      e.place = 'Please select a valid address from the suggestions.'
    if (form.businessType === 'online' && !form.websiteUrl.trim())
      e.websiteUrl = 'Add a website URL.'
    if (form.targetCustomers.length === 0)
      e.targetCustomers = 'Select at least one target customer.'
    if (form.targetCustomers.includes('Other') && !form.customTargetCustomer.trim())
      e.customTargetCustomer = 'Please describe your target customers.'
    return e
  }

  // ── API payload ──────────────────────────────────────────────────────────────
  function buildPayload() {
    const isOnline = form.businessType === 'online'
    const budget   = budgetToNumber(form.budgetRange)

    return {
      user_goal_mode:              'start_new',
      business_name:               form.businessName || 'My Business',
      business_concept:            form.description,
      products_services:           form.description,
      business_type:               form.businessCategory === 'Others'
                                     ? (form.customBusinessType || 'Other')
                                     : (form.businessCategory || 'Other'),
      business_type_other:         form.businessCategory === 'Others' ? form.customBusinessType : '',
      business_model_type:         form.businessType,
      state:                       isOnline ? (form.onlineState || 'NSW') : (form.place?.state ?? 'NSW'),
      suburb:                      isOnline ? '' : (form.place?.suburb ?? ''),
      city:                        isOnline ? '' : (form.place?.suburb ?? ''),
      postcode:                    form.place?.postcode ?? '',
      lat:                         form.place?.lat ?? null,
      lng:                         form.place?.lng ?? null,
      radius_km:                   form.radiusKm,
      website_url:                 form.websiteUrl,
      google_business_profile_url: form.googleBizUrl,
      delivery_coverage:           isOnline ? 'Australia-wide' : '',
      target_market:               isOnline ? form.country || 'Australia' : '',
      target_customers:            form.targetCustomers.length > 0
                                     ? form.targetCustomers.map(c =>
                                         c === 'Other' && form.customTargetCustomer
                                           ? form.customTargetCustomer
                                           : c
                                       )
                                     : ['General public'],
      staff_count:                 form.teamSize === 'Solo' ? 1 : form.teamSize === '2–5' ? 3 : form.teamSize === '6–20' ? 10 : 25,
      startup_budget:              String(budget),
      expected_revenue:            String(Math.round(budget * 0.25)),
      avg_price_range:             form.avgPriceRange || '$15–$50',
      launch_timeline:             form.launchTimeframe || '3–6 months',
      growth_goal:                 'Grow revenue',
      break_even_expectation:      '12–18 months',
      risk_tolerance:              'medium',
      current_monthly_revenue:     '',
      current_challenges:          [],
      growth_strategy_type:        '',
      current_location_suburb:     isOnline ? 'Online' : (form.place?.suburb ?? ''),
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function submit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSubmitting(true)
    try {
      const res  = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrors({ _apiError: data.error ?? 'Something went wrong. Please try again.' })
        setSubmitting(false)
        return
      }
      if (data._temp && data.report) {
        try {
          sessionStorage.setItem(
            `${TEMP_REPORT_KEY}_${data.reportId}`,
            JSON.stringify({ ...data.report, analysis: data.report }),
          )
        } catch {}
      }
      router.push(`/report/${data.reportId}`)
    } catch {
      setErrors({ _apiError: 'Network error. Please try again.' })
      setSubmitting(false)
    }
  }

  if (submitting) return <LoadingOverlay />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Home
        </Link>
        <span className="font-display font-bold text-slate-900">
          GlobalBiz <span className="gradient-text">AI</span>
        </span>
        <div className="w-20" />
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Free founder report · No account needed
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Tell us about your business</h1>
          <p className="mt-2 text-slate-500 text-sm">We&apos;ll scan the market and generate a 90-day action plan.</p>
        </div>

        {/* ── Step 1: Business basics ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">Step 1 — Business basics</h2>
          <div className="space-y-5">

            {/* Name */}
            <div>
              <label className="ui-label">Business name (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Adelaide Bread Co."
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="ui-label">Business category *</label>
              <div className="relative">
                <select
                  className={`form-input appearance-none pr-10 ${errors.businessCategory ? 'border-red-300' : ''}`}
                  value={form.businessCategory}
                  onChange={e => set('businessCategory', e.target.value)}
                >
                  <option value="">Select a category…</option>
                  {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.businessCategory && <p className="mt-1 text-xs text-red-600">{errors.businessCategory}</p>}
              {form.businessCategory === 'Others' && (
                <div className="mt-3">
                  <label htmlFor="customBusinessType" className="ui-label">Please specify your business type *</label>
                  <input
                    id="customBusinessType"
                    type="text"
                    className={`form-input ${errors.customBusinessType ? 'border-red-300' : ''}`}
                    placeholder="e.g. Mobile food truck, Pop-up store…"
                    value={form.customBusinessType}
                    onChange={e => set('customBusinessType', e.target.value)}
                    required
                  />
                  {errors.customBusinessType && <p className="mt-1 text-xs text-red-600">{errors.customBusinessType}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="ui-label">What does your business do? *</label>
              <textarea
                className={`form-input resize-none ${errors.description ? 'border-red-300' : ''}`}
                rows={3}
                placeholder="e.g. A specialty coffee shop focused on single-origin beans and fast weekday service for office workers."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            {/* Business type toggle */}
            <div>
              <label className="ui-label">Business type *</label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => set('businessType', 'physical')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    form.businessType === 'physical'
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MapPin size={15} /> Physical / Local
                </button>
                <button
                  type="button"
                  onClick={() => set('businessType', 'online')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    form.businessType === 'online'
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Globe size={15} /> Online / Digital
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 2: Location (conditional) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">Step 2 — Location</h2>

          {form.businessType === 'physical' && (
            <div className="space-y-4">
              <div>
                <label className="ui-label">Business address *</label>
                <AddressPicker
                  onSelect={p => set('place', p)}
                  onClear={() => set('place', null)}
                  selected={form.place}
                  error={errors.place}
                />
              </div>

              <div>
                <p className="ui-label mb-2">We&apos;ll find nearby competitors within this radius</p>
                <div className="flex gap-2 flex-wrap">
                  {RADIUS_OPTIONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set('radiusKm', r)}
                      className={form.radiusKm === r ? 'ui-chip-selected' : 'ui-chip'}
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.businessType === 'online' && (
            <div className="space-y-4">
              {/* Scrape banner */}
              {scrapeBanner && (
                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle size={15} className="mt-0.5 flex-shrink-0" />
                  We found info about your business — feel free to edit any details
                </div>
              )}

              <div>
                <label className="ui-label">Your business website *</label>
                <div className="relative">
                  <input
                    type="url"
                    className={`form-input ${errors.websiteUrl ? 'border-red-300' : ''} ${scraping ? 'pr-10' : ''}`}
                    placeholder="https://yourbusiness.com.au"
                    value={form.websiteUrl}
                    onChange={e => set('websiteUrl', e.target.value)}
                    onBlur={handleWebsiteBlur}
                  />
                  {scraping && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Loader2 size={14} className="animate-spin" />
                      Analysing your website…
                    </div>
                  )}
                </div>
                {errors.websiteUrl && <p className="mt-1 text-xs text-red-600">{errors.websiteUrl}</p>}
              </div>

              <div>
                <label className="ui-label">Google Business Profile URL (optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://g.page/your-business"
                  value={form.googleBizUrl}
                  onChange={e => set('googleBizUrl', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ui-label">Country</label>
                  <div className="relative">
                    <select
                      className="form-input appearance-none pr-10"
                      value={form.country}
                      onChange={e => set('country', e.target.value)}
                    >
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {form.country === 'Australia' && (
                  <div>
                    <label className="ui-label">State</label>
                    <div className="relative">
                      <select
                        className="form-input appearance-none pr-10"
                        value={form.onlineState}
                        onChange={e => set('onlineState', e.target.value)}
                      >
                        {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Step 3: Customers & goals ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">Step 3 — Customers &amp; goals</h2>
          <div className="space-y-5">

            <div>
              <label className="ui-label">Target customers * <span className="normal-case font-normal text-slate-400">(select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {TARGET_CUSTOMER_OPTIONS.map(chip => {
                  const selected = form.targetCustomers.includes(chip)
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setForm(f => {
                          const curr = f.targetCustomers
                          return {
                            ...f,
                            targetCustomers: curr.includes(chip)
                              ? curr.filter(c => c !== chip)
                              : [...curr, chip],
                          }
                        })
                      }}
                      className={selected ? 'ui-chip-selected' : 'ui-chip'}
                      style={selected ? { background: 'linear-gradient(135deg, #00c46a 0%, #00b8d9 100%)', border: 'none', color: '#fff', transform: 'scale(1.05)' } : {}}
                    >
                      {chip}
                    </button>
                  )
                })}
              </div>
              {errors.targetCustomers && <p className="mt-1 text-xs text-red-600">{errors.targetCustomers}</p>}
              {form.targetCustomers.includes('Other') && (
                <div className="mt-3">
                  <label htmlFor="customTargetCustomer" className="ui-label">Please describe your target customers</label>
                  <input
                    id="customTargetCustomer"
                    type="text"
                    className={`form-input ${errors.customTargetCustomer ? 'border-red-300' : ''}`}
                    placeholder="Please describe your target customers"
                    value={form.customTargetCustomer}
                    onChange={e => set('customTargetCustomer', e.target.value)}
                  />
                  {errors.customTargetCustomer && <p className="mt-1 text-xs text-red-600">{errors.customTargetCustomer}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="ui-label">Average price per product / service</label>
              <div className="flex gap-2 flex-wrap">
                {PRICE_OPTIONS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('avgPriceRange', p)}
                    className={form.avgPriceRange === p ? 'ui-chip-selected' : 'ui-chip'}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ui-label">Team size</label>
                <div className="relative">
                  <select
                    className="form-input appearance-none pr-10"
                    value={form.teamSize}
                    onChange={e => set('teamSize', e.target.value)}
                  >
                    {TEAM_SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="ui-label">Planned launch</label>
                <div className="relative">
                  <select
                    className="form-input appearance-none pr-10"
                    value={form.launchTimeframe}
                    onChange={e => set('launchTimeframe', e.target.value)}
                  >
                    {LAUNCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="ui-label">Budget range</label>
              <div className="flex gap-2 flex-wrap">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set('budgetRange', b)}
                    className={form.budgetRange === b ? 'ui-chip-selected' : 'ui-chip'}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API error banner */}
        {errors._apiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors._apiError}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          className="w-full ui-primary-btn py-4 text-base rounded-xl"
        >
          Generate Report <ArrowRight size={18} />
        </button>

        <p className="text-center text-xs text-slate-400">
          {form.businessType === 'physical'
            ? 'We\'ll automatically find competitors using Google Maps near your address.'
            : 'We\'ll analyse your website and find similar businesses online.'}
        </p>
      </div>
    </div>
  )
}
