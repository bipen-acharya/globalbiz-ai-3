'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MapPin,
  X,
} from 'lucide-react'
import { AU_STATES, searchSuburbs } from '@/lib/australia-suburbs'
import { BUSINESS_TYPES } from '@/lib/australia-business-rules'
import type { AustraliaSuburb, ExistingBusinessFormData } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'globalbiz_existing_draft'
const TEMP_REPORT_KEY = 'globalbiz_temp_report'

const YEARS_OPTIONS = ['Under 1 year', '1–3 years', '3–5 years', '5+ years'] as const
const TIMELINE_OPTIONS = ['1 month', '3 months', '6 months', '12 months'] as const

const PROBLEM_OPTIONS = [
  'Losing customers to competitors',
  'Revenue has been declining',
  'Poor online visibility / reviews',
  'Wrong location or foot traffic dropped',
  'Pricing too high or too low',
  'Staff or operational issues',
  'Not sure — need diagnosis',
] as const

const OWNER_GOAL_OPTIONS = [
  'Fix and grow the existing business',
  'Pivot to a different offering',
  'Sell or exit the business',
  'Expand to a second location',
] as const

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_FORM: ExistingBusinessFormData = {
  business_name:         '',
  business_type:         '',
  website_url:           '',
  google_maps_url:       '',
  address:               '',
  state:                 '',
  suburb:                '',
  postcode:              '',
  city:                  '',
  lat:                   null,
  lng:                   null,
  years_operating:       '',
  current_revenue:       '',
  staff_count:           1,
  description:           '',
  social_handles:        '',
  problems:              [],
  situation_description: '',
  what_tried:            '',
  owner_goal:            '',
  change_budget:         '',
  timeline:              '',
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ui-label mb-1.5 block">{label}</label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function SelectField({
  options,
  value,
  onChange,
  placeholder = 'Select…',
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select className="ui-input appearance-none pr-10" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function SuburbSearch({
  state,
  selected,
  onSelect,
  onClear,
}: {
  state: string
  selected: AustraliaSuburb | null
  onSelect: (s: AustraliaSuburb) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState(selected ? `${selected.suburb} ${selected.postcode}` : '')
  const [results, setResults] = useState<AustraliaSuburb[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) setQuery(`${selected.suburb} ${selected.postcode}`)
  }, [selected])

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [])

  function handleChange(v: string) {
    setQuery(v)
    if (!state || v.trim().length < 2) { setResults([]); setOpen(false); return }
    const hits = searchSuburbs(state, v.trim())
    setResults(hits)
    setOpen(hits.length > 0)
  }

  function pick(s: AustraliaSuburb) {
    onSelect(s)
    setQuery(`${s.suburb} ${s.postcode}`)
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        <input
          className="ui-input pl-9 pr-10"
          placeholder={state ? 'Search suburb or postcode…' : 'Select a state first'}
          disabled={!state}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false); onClear() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {results.map(s => (
            <li key={`${s.suburb}-${s.postcode}`}>
              <button type="button" className="flex w-full gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50" onClick={() => pick(s)}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  <span className="font-medium text-slate-900">{s.suburb}</span>
                  <span className="ml-2 text-slate-400">{s.postcode}</span>
                  <span className="ml-1 text-slate-400">· {s.council}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2] as const).map(n => (
        <div key={n} className={`h-2 rounded-full transition-all ${n === step ? 'w-8 bg-emerald-500' : n < step ? 'w-2 bg-emerald-300' : 'w-2 bg-slate-200'}`} />
      ))}
    </div>
  )
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Scanning nearby competitors…',
  'Diagnosing underperformance drivers…',
  'Mapping your market position…',
  'Building your turnaround plan…',
]

function LoadingOverlay({ visible }: { visible: boolean }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2200)
    return () => clearInterval(t)
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
        <div className="font-display text-base font-semibold text-slate-900">{LOADING_MESSAGES[msgIdx]}</div>
        <p className="mt-2 text-sm text-slate-500">Building your turnaround report…</p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExistingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<ExistingBusinessFormData>(DEFAULT_FORM)
  const [suburbObj, setSuburbObj] = useState<AustraliaSuburb | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ExistingBusinessFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { form: ExistingBusinessFormData; suburbObj: AustraliaSuburb | null }
        if (parsed.form) setForm(parsed.form)
        if (parsed.suburbObj) setSuburbObj(parsed.suburbObj)
      }
    } catch { /* ignore */ }
  }, [])

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, suburbObj }))
    } catch { /* ignore */ }
  }, [form, suburbObj])

  function patch(updates: Partial<ExistingBusinessFormData>) {
    setForm(prev => ({ ...prev, ...updates }))
    // Clear relevant errors
    const keys = Object.keys(updates) as (keyof ExistingBusinessFormData)[]
    if (keys.some(k => errors[k])) setErrors(prev => { const n = { ...prev }; keys.forEach(k => delete n[k]); return n })
  }

  function toggleProblem(p: string) {
    setForm(prev => ({
      ...prev,
      problems: prev.problems.includes(p)
        ? prev.problems.filter(x => x !== p)
        : [...prev.problems, p],
    }))
  }

  // ── Step 1 validation ───────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: typeof errors = {}
    if (!form.business_name.trim()) e.business_name = 'Business name is required.'
    if (!form.business_type) e.business_type = 'Please select a business type.'
    if (!form.state) e.state = 'Please select a state.'
    if (!suburbObj) e.suburb = 'Please search and select a suburb.'
    if (!form.years_operating) e.years_operating = 'Please select how long you\'ve been operating.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Step 2 validation ───────────────────────────────────────────────────────
  function validateStep2(): boolean {
    const e: typeof errors = {}
    if (!form.situation_description.trim()) e.situation_description = 'Please describe the situation — it helps us tailor the report.'
    if (!form.owner_goal) e.owner_goal = 'Please select what you want to do next.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goToStep2() {
    if (!validateStep1()) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!validateStep2()) return

    setLoading(true)
    setSubmitError(null)

    const payload: ExistingBusinessFormData = {
      ...form,
      suburb:  suburbObj?.suburb ?? form.suburb,
      postcode: suburbObj?.postcode ?? form.postcode,
      city:    suburbObj?.city ?? form.city,
      lat:     suburbObj?.lat ?? null,
      lng:     suburbObj?.lng ?? null,
    }

    try {
      const res = await fetch('/api/analyze-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) {
        throw new Error(`Server error (${res.status})`)
      }

      const json = await res.json()

      if (!res.ok || !json.success) {
        if (json.error === 'DAILY_LIMIT_REACHED') {
          setSubmitError('Today\'s report limit has been reached. Please try again tomorrow or join the waitlist.')
        } else {
          setSubmitError(json.error ?? `Error ${res.status}`)
        }
        return
      }

      // Cache and redirect to report
      try {
        sessionStorage.setItem(
          `${TEMP_REPORT_KEY}_${json.reportId}`,
          JSON.stringify({
            id:                json.reportId,
            created_at:        new Date().toISOString(),
            report_type:       'existing',
            user_goal_mode:    'grow_existing',
            business_name:     payload.business_name,
            state:             payload.state,
            city:              payload.city,
            suburb:            payload.suburb,
            postcode:          payload.postcode,
            business_type:     payload.business_type,
            business_model_type: 'physical',
            lat:               payload.lat,
            lng:               payload.lng,
            radius_km:         3,
            analysis:          json.report,
          })
        )
      } catch { /* ignore */ }

      // Clear draft on success
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

      router.push(`/report/${json.reportId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} />

      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-slate-900">
            GlobalBiz <span className="text-emerald-500">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <StepDots step={step} />
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step === 1 && (
              <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            )}
          </div>
        </nav>

        <div className="mx-auto max-w-2xl px-4 py-10">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="fade-up space-y-8">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                  Step 1 of 2 · About your business
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">
                  Tell us about your business
                </h1>
                <p className="mt-2 text-base leading-relaxed text-slate-600">
                  We'll use this to find your competitors, assess the local market, and build a focused turnaround plan.
                </p>
              </div>

              <div className="ui-section space-y-6">

                <Field label="Business name" error={errors.business_name}>
                  <input
                    className="ui-input"
                    placeholder="e.g. The Corner Café"
                    value={form.business_name}
                    onChange={e => patch({ business_name: e.target.value })}
                  />
                </Field>

                <Field label="Business type" error={errors.business_type}>
                  <SelectField
                    options={BUSINESS_TYPES}
                    value={form.business_type}
                    onChange={v => patch({ business_type: v })}
                    placeholder="Select a business type…"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Website URL" hint="Optional">
                    <input
                      className="ui-input"
                      type="url"
                      placeholder="https://yourbusiness.com.au"
                      value={form.website_url}
                      onChange={e => patch({ website_url: e.target.value })}
                    />
                  </Field>
                  <Field label="Google Maps listing URL" hint="Optional — helps us find your reviews">
                    <input
                      className="ui-input"
                      type="url"
                      placeholder="https://maps.google.com/…"
                      value={form.google_maps_url}
                      onChange={e => patch({ google_maps_url: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Physical address">
                  <input
                    className="ui-input"
                    placeholder="e.g. 42 King William St"
                    value={form.address}
                    onChange={e => patch({ address: e.target.value })}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="State" error={errors.state}>
                    <SelectField
                      options={AU_STATES}
                      value={form.state}
                      onChange={v => { patch({ state: v, suburb: '', postcode: '', city: '', lat: null, lng: null }); setSuburbObj(null) }}
                      placeholder="Select a state…"
                    />
                  </Field>
                  <Field label="Suburb" error={errors.suburb}>
                    <SuburbSearch
                      state={form.state}
                      selected={suburbObj}
                      onSelect={s => { setSuburbObj(s); patch({ suburb: s.suburb, postcode: s.postcode, city: s.city, lat: s.lat, lng: s.lng }) }}
                      onClear={() => { setSuburbObj(null); patch({ suburb: '', postcode: '', city: '', lat: null, lng: null }) }}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="How long have you been operating?" error={errors.years_operating}>
                    <SelectField
                      options={YEARS_OPTIONS}
                      value={form.years_operating}
                      onChange={v => patch({ years_operating: v })}
                      placeholder="Select…"
                    />
                  </Field>
                  <Field label="Current monthly revenue" hint="Rough estimate is fine">
                    <input
                      className="ui-input"
                      placeholder="e.g. $18,000"
                      value={form.current_revenue}
                      onChange={e => patch({ current_revenue: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current staff count" hint="Including yourself">
                    <input
                      className="ui-input"
                      type="number"
                      min={1}
                      value={form.staff_count}
                      onChange={e => patch({ staff_count: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                  </Field>
                  <Field label="Social media handles" hint="Optional · comma separated">
                    <input
                      className="ui-input"
                      placeholder="@mycafe, @mycafe_au"
                      value={form.social_handles}
                      onChange={e => patch({ social_handles: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Business description — what do you offer?" hint="Include your main products, services, and target customers">
                  <textarea
                    className="ui-input min-h-[100px] resize-y"
                    placeholder="e.g. A neighbourhood café serving specialty coffee and light meals, targeting local office workers and families…"
                    value={form.description}
                    onChange={e => patch({ description: e.target.value })}
                  />
                </Field>

              </div>

              <button
                type="button"
                onClick={goToStep2}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
              >
                Next — what&apos;s the challenge?
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="fade-up space-y-8">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                  Step 2 of 2 · What&apos;s not working
                </div>
                <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">
                  What&apos;s the challenge?
                </h1>
                <p className="mt-2 text-base leading-relaxed text-slate-600">
                  The more detail you share, the more targeted your turnaround plan will be.
                </p>
              </div>

              <div className="ui-section space-y-7">

                {/* Problems multi-select */}
                <div>
                  <label className="ui-label mb-3 block">What&apos;s the main problem? <span className="font-normal text-slate-400">(select all that apply)</span></label>
                  <div className="space-y-2">
                    {PROBLEM_OPTIONS.map(p => {
                      const checked = form.problems.includes(p)
                      return (
                        <label key={p} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${checked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProblem(p)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-500"
                          />
                          <span className={`text-sm font-medium ${checked ? 'text-emerald-800' : 'text-slate-700'}`}>{p}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Situation */}
                <Field label="Describe the situation in your own words" hint="What is happening, when it started, and how it affects the business" error={errors.situation_description}>
                  <textarea
                    className="ui-input min-h-[120px] resize-y"
                    placeholder="e.g. Revenue has been dropping for 3 months since a new café opened 200m away. Our regulars still come but foot traffic from new customers has almost stopped…"
                    value={form.situation_description}
                    onChange={e => patch({ situation_description: e.target.value })}
                  />
                </Field>

                {/* What tried */}
                <Field label="What have you already tried?" hint="Optional — helps us avoid recommending things you've already done">
                  <textarea
                    className="ui-input min-h-[80px] resize-y"
                    placeholder="e.g. We ran a discount campaign last month and updated our Instagram. Didn't move the needle…"
                    value={form.what_tried}
                    onChange={e => patch({ what_tried: e.target.value })}
                  />
                </Field>

                {/* Owner goal */}
                <div>
                  <label className="ui-label mb-3 block">What do you want to do next?</label>
                  {errors.owner_goal && <p className="mb-2 text-xs text-red-600">{errors.owner_goal}</p>}
                  <div className="space-y-2">
                    {OWNER_GOAL_OPTIONS.map(g => (
                      <label key={g} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${form.owner_goal === g ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="owner_goal"
                          value={g}
                          checked={form.owner_goal === g}
                          onChange={() => patch({ owner_goal: g })}
                          className="h-4 w-4 border-slate-300 text-emerald-600 accent-emerald-500"
                        />
                        <span className={`text-sm font-medium ${form.owner_goal === g ? 'text-emerald-800' : 'text-slate-700'}`}>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Monthly budget for changes" hint="Rough estimate — helps size the recommendations">
                    <input
                      className="ui-input"
                      placeholder="e.g. $2,000 / month"
                      value={form.change_budget}
                      onChange={e => patch({ change_budget: e.target.value })}
                    />
                  </Field>
                  <Field label="Timeline to see results">
                    <SelectField
                      options={TIMELINE_OPTIONS}
                      value={form.timeline}
                      onChange={v => patch({ timeline: v })}
                      placeholder="Select timeline…"
                    />
                  </Field>
                </div>

              </div>

              {/* Summary of step 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Analysing</div>
                <div className="font-display font-semibold text-slate-900">{form.business_name || form.business_type}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {[form.suburb, form.state, form.years_operating ? `${form.years_operating} operating` : null].filter(Boolean).join(' · ')}
                </div>
                <button type="button" onClick={() => setStep(1)} className="mt-2 text-xs text-emerald-600 hover:text-emerald-700">
                  Edit details →
                </button>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Generating turnaround report…
                  </>
                ) : (
                  <>
                    Generate turnaround report
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
