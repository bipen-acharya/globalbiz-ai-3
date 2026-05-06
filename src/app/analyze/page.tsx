'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Globe,
  MapPin,
} from 'lucide-react'
import { AU_STATES, searchSuburbs as _searchSuburbs, ALL_SUBURBS } from '@/lib/australia-suburbs'
import type { AustraliaSuburb } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMP_REPORT_KEY = 'globalbiz_temp_report'

const TEAM_SIZE_OPTIONS = ['Solo', '2–5', '6–20', '20+'] as const
const LAUNCH_OPTIONS    = ['Within 3 months', '3–6 months', '6–12 months', '1+ year'] as const
const BUDGET_OPTIONS    = ['Under $5K', '$5K–$20K', '$20K–$50K', '$50K–$100K', '$100K+'] as const
const GOAL_OPTIONS      = ['Launch new business', 'Grow existing business', 'Validate idea'] as const
const PRICE_OPTIONS     = ['Under $15', '$15–$50', '$50–$150', '$150–$500', '$500+', 'Custom quote'] as const
const RADIUS_OPTIONS    = [5, 10, 20, 50] as const

const BUSINESS_CATEGORIES = [
  'Café / Coffee shop', 'Restaurant / Takeaway', 'Bakery', 'Bar / Pub', 'Food truck',
  'Retail store', 'Online store / eCommerce', 'Clothing & fashion', 'Grocery / Supermarket',
  'Beauty salon / Barber', 'Gym / Fitness studio', 'Health & wellness', 'Medical / Allied health',
  'Childcare / Education', 'Real estate', 'Cleaning services', 'Trades / Handyman',
  'IT services / Software', 'Marketing / Agency', 'Accounting / Finance',
  'Legal services', 'Consulting', 'Other',
] as const

const LOADING_STAGES = [
  { label: 'Scanning competitors…',    sub: 'Pulling real Google Maps data and competitor signals.' },
  { label: 'Analysing demand…',        sub: 'Measuring market demand, audience fit, and market gaps.' },
  { label: 'Generating insights…',     sub: 'Scoring viability, differentiation, and expansion readiness.' },
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
type Errors = Partial<Record<keyof FormState | 'suburb', string>>

interface FormState {
  businessName:    string
  description:     string
  businessType:    BusinessType
  businessCategory:string
  suburb:          AustraliaSuburb | null
  suburbText:      string        // raw typed text — fallback when no autocomplete selection
  state:           string
  radiusKm:        number
  websiteUrl:      string
  googleBizUrl:    string
  targetCustomers: string
  teamSize:        string
  launchTimeframe: string
  budgetRange:     string
  avgPriceRange:   string
  goal:            string
  competitor1:     string
  competitor2:     string
  competitor3:     string
  notes:           string
}

const DEFAULT_FORM: FormState = {
  businessName:    '',
  description:     '',
  businessType:    'physical',
  businessCategory:'',
  suburb:          null,
  suburbText:      '',
  state:           '',
  radiusKm:        10,
  websiteUrl:      '',
  googleBizUrl:    '',
  targetCustomers: '',
  teamSize:        'Solo',
  launchTimeframe: '3–6 months',
  budgetRange:     '$5K–$20K',
  avgPriceRange:   '$15–$50',
  goal:            'Launch new business',
  competitor1:     '',
  competitor2:     '',
  competitor3:     '',
  notes:           '',
}

// ─── Suburb search hook ───────────────────────────────────────────────────────

function useSuburbSearch(state: string) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<AustraliaSuburb[]>([])
  const [open,    setOpen]    = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string, currentState: string) => {
    setQuery(q)
    if (debounce.current) clearTimeout(debounce.current)
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    debounce.current = setTimeout(() => {
      const lower = q.toLowerCase()
      const pool = currentState
        ? _searchSuburbs(currentState, q)
        : ALL_SUBURBS.filter(s =>
            s.suburb.toLowerCase().startsWith(lower) || s.postcode.startsWith(q)
          ).slice(0, 8)
      setResults(pool)
      setOpen(pool.length > 0)
    }, 200)
  }, [])

  return {
    query, setQuery,
    results, open, setOpen,
    search: (q: string) => search(q, state),
  }
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay() {
  const [stageIdx, setStageIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStageIdx(i => Math.min(i + 1, LOADING_STAGES.length - 1)), 2500)
    return () => clearInterval(t)
  }, [])
  const stage = LOADING_STAGES[stageIdx]
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
  const router  = useRouter()
  const [form,       setForm]       = useState<FormState>(DEFAULT_FORM)
  const [errors,     setErrors]     = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [page,       setPage]       = useState<1 | 2>(1)
  const suburb = useSuburbSearch(form.state)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  // Resolved suburb name: prefer the selected object, fall back to typed text
  const resolvedSuburb = form.suburb?.suburb ?? form.suburbText.trim()

  // ── Payload builder ──────────────────────────────────────────────────────────
  function buildPayload() {
    const isOnline = form.businessType === 'online'
    const budget   = budgetToNumber(form.budgetRange)
    const goalMode = form.goal === 'Grow existing business' ? 'grow_existing' : 'start_new'

    return {
      user_goal_mode:             goalMode,
      business_name:              form.businessName || 'My Business',
      business_concept:           form.description,
      products_services:          form.description,
      business_type:              form.businessCategory || 'Other',
      business_model_type:        form.businessType,
      state:                      form.suburb?.state ?? form.state ?? 'New South Wales',
      suburb:                     isOnline ? '' : resolvedSuburb,
      city:                       isOnline ? '' : (form.suburb?.city ?? resolvedSuburb),
      postcode:                   form.suburb?.postcode ?? '',
      lat:                        form.suburb?.lat ?? null,
      lng:                        form.suburb?.lng ?? null,
      radius_km:                  form.radiusKm,
      website_url:                form.websiteUrl,
      google_business_profile_url:form.googleBizUrl,
      delivery_coverage:          isOnline ? 'Australia-wide' : '',
      target_market:              isOnline ? 'Australia' : '',
      target_customers:           form.targetCustomers ? [form.targetCustomers] : ['General public'],
      staff_count:                form.teamSize === 'Solo' ? 1 : form.teamSize === '2–5' ? 3 : form.teamSize === '6–20' ? 10 : 25,
      startup_budget:             String(budget),
      expected_revenue:           String(Math.round(budget * 0.25)),
      avg_price_range:            form.avgPriceRange || '$15–$50',
      launch_timeline:            form.launchTimeframe || '3–6 months',
      growth_goal:                'Grow revenue',
      break_even_expectation:     '12–18 months',
      risk_tolerance:             'medium',
      competitor_url_1:           form.competitor1,
      competitor_url_2:           form.competitor2,
      competitor_url_3:           form.competitor3,
      current_monthly_revenue:    goalMode === 'grow_existing' ? String(budget / 12) : '',
      current_challenges:         goalMode === 'grow_existing' ? ['Revenue growth'] : [],
      growth_strategy_type:       goalMode === 'grow_existing' ? 'Digital expansion' : '',
      current_location_suburb:    isOnline ? '' : resolvedSuburb,
    }
  }

  // ── Page 1 validation (run on Next button) ───────────────────────────────────
  function validatePage1(): Errors {
    const e: Errors = {}
    if (!form.businessCategory)   e.businessCategory = 'Choose a business category.'
    if (!form.description.trim()) e.description      = 'Add a short description.'
    if (form.businessType === 'physical') {
      if (!form.state) e.state = 'Select a state.'
      if (!form.suburb && form.suburbText.trim().length < 3)
        e.suburb = 'Select a suburb from the list, or type at least 3 characters and press Enter.'
    }
    if (form.businessType === 'online' && !form.websiteUrl.trim())
      e.websiteUrl = 'Add a website URL.'
    if (!form.targetCustomers.trim()) e.targetCustomers = 'Describe your target customers.'
    return e
  }

  // ── Final submit ─────────────────────────────────────────────────────────────
  async function submit() {
    // Re-run page 1 checks (catches errors if user navigated back and changed fields)
    const p1 = validatePage1()
    if (Object.keys(p1).length > 0) { setErrors(p1); setPage(1); return }

    setSubmitting(true)
    try {
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrors({ description: data.error ?? 'Something went wrong. Please try again.' })
        setSubmitting(false)
        setPage(1)
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
      setErrors({ description: 'Network error. Please try again.' })
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

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Free founder report · No account needed
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Tell us about your business</h1>
          <p className="mt-2 text-slate-500 text-sm">We&apos;ll generate a market analysis and 90-day action plan.</p>
        </div>

        <FormView
          form={form}
          set={set}
          errors={errors}
          setErrors={setErrors}
          page={page}
          setPage={setPage}
          suburb={suburb}
          validatePage1={validatePage1}
          onSubmit={submit}
        />
      </div>
    </div>
  )
}

// ─── Form view ────────────────────────────────────────────────────────────────

interface FormViewProps {
  form:            FormState
  set:             <K extends keyof FormState>(key: K, val: FormState[K]) => void
  errors:          Errors
  setErrors:       (e: Errors) => void
  page:            1 | 2
  setPage:         (p: 1 | 2) => void
  suburb:          ReturnType<typeof useSuburbSearch>
  validatePage1:   () => Errors
  onSubmit:        () => void
}

function FormView({ form, set, errors, setErrors, page, setPage, suburb, validatePage1, onSubmit }: FormViewProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        suburb.setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [suburb])

  // Select a suburb from autocomplete
  const selectSuburb = (s: AustraliaSuburb) => {
    set('suburb', s)
    set('state',  s.state)
    set('suburbText', '')          // clear text fallback — we have the full object
    suburb.setQuery(`${s.suburb}, ${s.state} ${s.postcode}`)
    suburb.setOpen(false)
  }

  // Handle suburb text input change
  const handleSuburbChange = (value: string) => {
    suburb.search(value)           // search autocomplete
    set('suburbText', value)       // store raw text as fallback
    if (form.suburb) set('suburb', null)  // clear object if user retypes
  }

  // Advance to page 2 after validating page 1
  const handleNext = () => {
    const e = validatePage1()
    setErrors(e)
    if (Object.keys(e).length === 0) setPage(2)
  }

  return (
    <div className="space-y-6">
      {page === 1 && (
        <>
          {/* ── Business basics ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">Your business</h2>
            <div className="space-y-5">

              {/* Business name */}
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

              {/* Physical location fields */}
              {form.businessType === 'physical' && (
                <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  {/* State selector */}
                  <div>
                    <label className="ui-label">State *</label>
                    <div className="relative">
                      <select
                        className={`form-input appearance-none pr-10 ${errors.state ? 'border-red-300' : ''}`}
                        value={form.state}
                        onChange={e => set('state', e.target.value)}
                      >
                        <option value="">Select state…</option>
                        {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                  </div>

                  {/* Suburb autocomplete */}
                  <div ref={dropdownRef}>
                    <label className="ui-label">Suburb *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.suburb ? 'border-red-300' : ''}`}
                      placeholder="Search suburb… (e.g. Norwood)"
                      value={suburb.query}
                      onChange={e => handleSuburbChange(e.target.value)}
                      onKeyDown={e => {
                        // Accept typed text on Enter (no autocomplete needed)
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          suburb.setOpen(false)
                          // suburbText already set via handleSuburbChange
                        }
                      }}
                      onBlur={() => {
                        // Close dropdown after a brief delay so click on result fires first
                        setTimeout(() => suburb.setOpen(false), 150)
                      }}
                    />
                    {errors.suburb && <p className="mt-1 text-xs text-red-600">{errors.suburb}</p>}

                    {/* Dropdown results */}
                    {suburb.open && suburb.results.length > 0 && (
                      <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-20 relative">
                        {suburb.results.map(s => (
                          <button
                            key={`${s.suburb}-${s.postcode}`}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                            onMouseDown={e => e.preventDefault()}  // prevent onBlur firing before click
                            onClick={() => selectSuburb(s)}
                          >
                            <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                            <span className="font-medium">{s.suburb}</span>
                            <span className="text-slate-400">{s.state} {s.postcode}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Confirmation badge when suburb is selected */}
                    {form.suburb && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                        <MapPin size={11} />
                        <span>{form.suburb.suburb}, {form.suburb.state} {form.suburb.postcode}</span>
                      </div>
                    )}
                  </div>

                  {/* Radius chips */}
                  <div>
                    <label className="ui-label">Competitor search radius</label>
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

              {/* Online-only fields */}
              {form.businessType === 'online' && (
                <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <label className="ui-label">Website URL *</label>
                    <input
                      type="url"
                      className={`form-input ${errors.websiteUrl ? 'border-red-300' : ''}`}
                      placeholder="https://yourbusiness.com.au"
                      value={form.websiteUrl}
                      onChange={e => set('websiteUrl', e.target.value)}
                    />
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
                </div>
              )}
            </div>
          </div>

          {/* ── Customers & goals ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">Customers &amp; goals</h2>
            <div className="space-y-5">

              <div>
                <label className="ui-label">Target customers *</label>
                <input
                  type="text"
                  className={`form-input ${errors.targetCustomers ? 'border-red-300' : ''}`}
                  placeholder="e.g. 25–45 year olds, working professionals, local families"
                  value={form.targetCustomers}
                  onChange={e => set('targetCustomers', e.target.value)}
                />
                {errors.targetCustomers && <p className="mt-1 text-xs text-red-600">{errors.targetCustomers}</p>}
              </div>

              <div>
                <label className="ui-label">Average price per product/service</label>
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

              <div>
                <label className="ui-label">Business goal</label>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map(g => (
                    <label
                      key={g}
                      className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50 transition-all has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50"
                    >
                      <input
                        type="radio"
                        name="goal"
                        value={g}
                        checked={form.goal === g}
                        onChange={() => set('goal', g)}
                        className="text-blue-600"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full ui-primary-btn py-4 text-base rounded-xl"
          >
            Next: Competitors &amp; Market <ArrowRight size={18} />
          </button>
        </>
      )}

      {page === 2 && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">Competitors &amp; market</h2>
            <p className="text-sm text-slate-500 mb-5">
              Optional — we&apos;ll find competitors automatically if you skip this.
            </p>
            <div className="space-y-5">
              {form.businessType === 'physical' ? (
                <>
                  <p className="text-xs text-slate-400">
                    Up to 3 known competitor names (searched within {form.radiusKm}km radius)
                  </p>
                  {([1, 2, 3] as const).map(n => (
                    <div key={n}>
                      <label className="ui-label">Competitor {n} name (optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={n === 1 ? "e.g. Mike's Café" : n === 2 ? 'e.g. The Coffee House' : 'e.g. Bean Scene'}
                        value={form[`competitor${n}` as 'competitor1']}
                        onChange={e => set(`competitor${n}` as 'competitor1', e.target.value)}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-400">
                    Up to 3 competitor website URLs (no location restriction)
                  </p>
                  {([1, 2, 3] as const).map(n => (
                    <div key={n}>
                      <label className="ui-label">Competitor {n} URL (optional)</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://competitor.com.au"
                        value={form[`competitor${n}` as 'competitor1']}
                        onChange={e => set(`competitor${n}` as 'competitor1', e.target.value)}
                      />
                    </div>
                  ))}
                </>
              )}

              <div>
                <label className="ui-label">Additional notes (optional)</label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Anything else we should know about your market, constraints, or vision?"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPage(1)}
              className="ui-secondary-btn px-6 py-4 rounded-xl"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 ui-primary-btn py-4 text-base rounded-xl"
            >
              Generate Report <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
