'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Globe,
  MapPin,
  ShoppingBag,
} from 'lucide-react'
import { AU_STATES } from '@/lib/australia-suburbs'
import { BUSINESS_TYPES } from '@/lib/australia-business-rules'
import { AddressPicker } from '@/components/AddressPicker'
import type { PlaceResult } from '@/components/AddressPicker'
import type { ExistingBusinessFormData } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'globalbiz_existing_draft'
const TEMP_REPORT_KEY = 'globalbiz_temp_report'

const YEARS_OPTIONS = ['Under 1 year', '1–3 years', '3–5 years', '5+ years'] as const
const TIMELINE_OPTIONS = ['1 month', '3 months', '6 months', '12 months'] as const
const RADIUS_OPTIONS = [5, 10, 20, 50] as const

const COUNTRIES = [
  'Australia', 'United States', 'United Kingdom', 'Canada', 'New Zealand',
  'Singapore', 'India', 'Germany', 'France', 'Other',
] as const

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
  location_type:         'physical',
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
  radius_km:             10,
  country:               'Australia',
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
      {hint && <p className="mb-2 text-xs" style={{ color: 'var(--paper-4)' }}>{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}

function SelectField({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}) {
  return (
    <div className="relative">
      <select
        className={`form-input appearance-none pr-10 ${error ? 'border-red-300' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

function normaliseUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    // Must have a domain with at least one dot
    if (!u.hostname.includes('.')) return false
    return true
  } catch {
    return false
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2] as const).map(n => (
        <div
          key={n}
          className="h-2 rounded-full transition-all"
          style={{
            width: n === step ? 28 : 8,
            background: n === step ? 'var(--gold)' : n < step ? 'var(--gold-2)' : 'var(--line-3)',
          }}
        />
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
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--ink-0)', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4" style={{ borderColor: 'var(--gold-soft)', borderTopColor: 'var(--gold)' }} />
        <div className="font-display text-base font-semibold" style={{ color: 'var(--paper)' }}>{LOADING_MESSAGES[msgIdx]}</div>
        <p className="mt-2 text-sm" style={{ color: 'var(--paper-3)' }}>Building your turnaround report…</p>
      </div>
    </div>
  )
}

// ─── Location type selector ───────────────────────────────────────────────────

type LocationType = 'physical' | 'online' | 'both'

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'physical',
    label: 'Physical only',
    icon: <MapPin size={20} />,
    description: 'Storefront, office, or premises — customers come to you',
  },
  {
    value: 'online',
    label: 'Online only',
    icon: <Globe size={20} />,
    description: 'eCommerce, SaaS, or service delivered online',
  },
  {
    value: 'both',
    label: 'Both',
    icon: <ShoppingBag size={20} />,
    description: 'Physical location plus an online presence',
  },
]

function LocationTypeSelector({
  value,
  onChange,
}: {
  value: LocationType
  onChange: (v: LocationType) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {LOCATION_TYPE_OPTIONS.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center transition-all"
            style={{
              border: `1px solid ${active ? 'var(--gold)' : 'var(--line-2)'}`,
              background: active ? 'var(--gold-soft)' : 'var(--ink-0)',
              boxShadow: active ? '0 0 0 3px var(--gold-soft)' : 'none',
            }}
          >
            <span style={{ color: active ? 'var(--gold)' : 'var(--paper-3)' }}>{opt.icon}</span>
            <span className="text-sm font-semibold" style={{ color: active ? 'var(--gold)' : 'var(--paper)' }}>
              {opt.label}
            </span>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--paper-3)' }}>{opt.description}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExistingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<ExistingBusinessFormData>(DEFAULT_FORM)
  const [place, setPlace] = useState<PlaceResult | null>(null)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { form: ExistingBusinessFormData; place: PlaceResult | null }
        // Merge with DEFAULT_FORM so new fields (location_type, radius_km, country) always have values
        if (parsed.form) setForm({ ...DEFAULT_FORM, ...parsed.form })
        if (parsed.place) setPlace(parsed.place)
      }
    } catch { /* ignore */ }
  }, [])

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, place }))
    } catch { /* ignore */ }
  }, [form, place])

  function patch(updates: Partial<ExistingBusinessFormData>) {
    setForm(prev => ({ ...prev, ...updates }))
    const keys = Object.keys(updates)
    if (keys.some(k => errors[k])) {
      setErrors(prev => { const n = { ...prev }; keys.forEach(k => delete n[k]); return n })
    }
  }

  function setLocationType(lt: LocationType) {
    patch({
      location_type: lt,
      // Reset location fields when switching type
      address: '', state: '', suburb: '', postcode: '', city: '', lat: null, lng: null,
      website_url: '', google_maps_url: '',
    })
    setPlace(null)
  }

  function toggleProblem(p: string) {
    setForm(prev => ({
      ...prev,
      problems: prev.problems.includes(p)
        ? prev.problems.filter(x => x !== p)
        : [...prev.problems, p],
    }))
  }

  const isPhysical = form.location_type === 'physical'
  const isOnline   = form.location_type === 'online'
  const isBoth     = form.location_type === 'both'
  const needsAddress = isPhysical || isBoth
  const needsWebsite = isOnline || isBoth

  // ── Step 1 validation ─────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: Record<string, string> = {}
    if (!form.business_name.trim()) e.business_name = 'Business name is required.'
    if (!form.business_type) e.business_type = 'Please select a business type.'

    if (needsAddress) {
      if (!place) e.place = 'Please select a valid address from the suggestions.'
    }
    if (isOnline) {
      if (!form.state) e.state = 'Please select a state/region.'
    }
    if (needsWebsite && !form.website_url.trim()) {
      e.website_url = 'Website URL is required.'
    }
    if (!form.years_operating) e.years_operating = 'Please select how long you\'ve been operating.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Step 2 validation ─────────────────────────────────────────────────────
  function validateStep2(): boolean {
    const e: Record<string, string> = {}
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

    // ── For online businesses: validate URL format, then optionally scrape for enrichment ──
    if (needsWebsite && form.website_url.trim()) {
      const normalised = normaliseUrl(form.website_url.trim())
      if (!isValidUrl(normalised)) {
        setSubmitError('That website URL doesn\'t look valid. Please enter a full address like https://yourbusiness.com.au')
        setLoading(false)
        setStep(1)
        setErrors(prev => ({ ...prev, website_url: 'Invalid URL format.' }))
        return
      }

      // Patch with normalised URL immediately — always proceed regardless of scrape result
      patch({ website_url: normalised })

      // Attempt scrape for content enrichment (optional — many sites block server-side fetches)
      try {
        const scrapeRes = await fetch('/api/scrape-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalised }),
        })
        const scrapeJson = await scrapeRes.json()
        // If we got useful content, auto-fill a sparse description
        if (scrapeJson.success && scrapeJson.data?.description && !form.description.trim()) {
          patch({ description: scrapeJson.data.description })
        }
      } catch {
        // Scrape failed (network, bot-block, timeout) — that's fine, proceed without it
      }
    }

    const payload: ExistingBusinessFormData = needsAddress && place
      ? {
          ...form,
          address:  place.formattedAddress,
          suburb:   place.suburb,
          postcode: place.postcode,
          city:     place.suburb,
          state:    place.state,
          lat:      place.lat,
          lng:      place.lng,
        }
      : form

    try {
      const res = await fetch('/api/analyze-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)

      const json = await res.json()

      if (!res.ok || !json.success) {
        if (json.error === 'TOTAL_LIMIT_REACHED') {
          router.push('/coming-soon')
          return
        }
        if (json.error === 'DAILY_LIMIT_REACHED') {
          setSubmitError('Today\'s report limit has been reached. Please try again tomorrow or join the waitlist.')
        } else {
          setSubmitError(json.error ?? `Error ${res.status}`)
        }
        return
      }

      try {
        sessionStorage.setItem(
          `${TEMP_REPORT_KEY}_${json.reportId}`,
          JSON.stringify({
            id:                  json.reportId,
            created_at:          new Date().toISOString(),
            report_type:         'existing',
            user_goal_mode:      'grow_existing',
            business_name:       payload.business_name,
            state:               payload.state,
            city:                payload.city,
            suburb:              payload.suburb,
            postcode:            payload.postcode,
            business_type:       payload.business_type,
            business_model_type: payload.location_type === 'online' ? 'online' : payload.location_type === 'both' ? 'hybrid' : 'physical',
            lat:                 payload.lat,
            lng:                 payload.lng,
            radius_km:           payload.radius_km,
            analysis:            json.report,
          })
        )
      } catch { /* ignore */ }

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

      <div className="min-h-screen" style={{ background: 'var(--ink-1)', color: 'var(--paper)' }}>
        {/* Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 backdrop-blur-md nav-blur">
          <Link href="/" className="flex items-center gap-2 transition-colors" style={{ color: 'var(--paper-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--paper-3)')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
              GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <StepDots step={step} />
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'var(--paper-3)' }}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
          </div>
        </nav>

        <div className="mx-auto max-w-2xl px-4 py-10">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="fade-up space-y-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide" style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
                  Step 1 of 2 · About your business
                </div>
                <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--paper)' }}>
                  Tell us about your business
                </h1>
                <p className="mt-2 text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
                  We&apos;ll use this to find competitors, assess your market, and build a focused turnaround plan.
                </p>
              </div>

              {/* Business type selector — FIRST question */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-display text-sm font-semibold mb-4" style={{ color: 'var(--paper)' }}>
                  Is your business Physical, Online, or Both? *
                </h2>
                <LocationTypeSelector value={form.location_type} onChange={setLocationType} />
              </div>

              {/* Location section — conditional on type */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--paper)' }}>Location &amp; online presence</h2>

                {/* Physical / Both — Google Maps address picker */}
                {needsAddress && (
                  <div className="space-y-4 rounded-xl p-4" style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}>
                    <Field label="Business address *" error={errors.place}>
                      <AddressPicker
                        onSelect={p => {
                          setPlace(p)
                          patch({ address: p.formattedAddress, suburb: p.suburb, postcode: p.postcode, city: p.suburb, state: p.state, lat: p.lat, lng: p.lng })
                          if (errors.place) setErrors(prev => { const n = { ...prev }; delete n.place; return n })
                        }}
                        onClear={() => {
                          setPlace(null)
                          patch({ address: '', suburb: '', postcode: '', city: '', lat: null, lng: null })
                        }}
                        selected={place}
                        error={errors.place}
                      />
                    </Field>

                    <div>
                      <label className="ui-label">Competitor search radius</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {RADIUS_OPTIONS.map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => patch({ radius_km: r })}
                            className={form.radius_km === r ? 'ui-chip-selected' : 'ui-chip'}
                          >
                            {r}km
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Online only — country + state */}
                {isOnline && (
                  <div className="space-y-4 rounded-xl p-4" style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}>
                    <Field label="Country *">
                      <SelectField
                        options={COUNTRIES}
                        value={form.country}
                        onChange={v => patch({ country: v, state: '' })}
                        placeholder="Select country…"
                      />
                    </Field>
                    {form.country === 'Australia' && (
                      <Field label="State *" error={errors.state}>
                        <SelectField
                          options={AU_STATES}
                          value={form.state}
                          onChange={v => patch({ state: v })}
                          placeholder="Select a state…"
                          error={errors.state}
                        />
                      </Field>
                    )}
                    {form.country && form.country !== 'Australia' && (
                      <Field label="State / Region *" error={errors.state}>
                        <input
                          className={`form-input ${errors.state ? 'border-red-300' : ''}`}
                          placeholder="e.g. California, Ontario, England"
                          value={form.state}
                          onChange={e => patch({ state: e.target.value })}
                        />
                      </Field>
                    )}
                  </div>
                )}

                {/* Website URL — required for online/both, optional for physical */}
                <Field
                  label={needsWebsite ? 'Website URL *' : 'Website URL'}
                  hint={!needsWebsite ? 'Optional' : undefined}
                  error={errors.website_url}
                >
                  <input
                    className={`form-input ${errors.website_url ? 'border-red-300' : ''}`}
                    type="url"
                    placeholder="https://yourbusiness.com.au"
                    value={form.website_url}
                    onChange={e => patch({ website_url: e.target.value })}
                  />
                </Field>

                {/* Google Business URL — for online/both */}
                {(isOnline || isBoth) && (
                  <Field label="Google Business Profile URL" hint="Optional — helps us find your reviews">
                    <input
                      className="form-input"
                      type="url"
                      placeholder="https://maps.google.com/…"
                      value={form.google_maps_url}
                      onChange={e => patch({ google_maps_url: e.target.value })}
                    />
                  </Field>
                )}
              </div>

              {/* Business details */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-display text-sm font-semibold" style={{ color: 'var(--paper)' }}>Business details</h2>

                <Field label="Business name *" error={errors.business_name}>
                  <input
                    className={`form-input ${errors.business_name ? 'border-red-300' : ''}`}
                    placeholder="e.g. The Corner Café"
                    value={form.business_name}
                    onChange={e => patch({ business_name: e.target.value })}
                  />
                </Field>

                <Field label="Business type / industry *" error={errors.business_type}>
                  <SelectField
                    options={BUSINESS_TYPES}
                    value={form.business_type}
                    onChange={v => patch({ business_type: v })}
                    placeholder="Select a business type…"
                    error={errors.business_type}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="How long operating? *" error={errors.years_operating}>
                    <SelectField
                      options={YEARS_OPTIONS}
                      value={form.years_operating}
                      onChange={v => patch({ years_operating: v })}
                      placeholder="Select…"
                      error={errors.years_operating}
                    />
                  </Field>
                  <Field label="Current monthly revenue" hint="Rough estimate is fine">
                    <input
                      className="form-input"
                      placeholder="e.g. $18,000"
                      value={form.current_revenue}
                      onChange={e => patch({ current_revenue: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Current staff count" hint="Including yourself">
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      value={form.staff_count}
                      onChange={e => patch({ staff_count: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                  </Field>
                  <Field label="Social media handles" hint="Optional · comma separated">
                    <input
                      className="form-input"
                      placeholder="@mycafe, @mycafe_au"
                      value={form.social_handles}
                      onChange={e => patch({ social_handles: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="What do you offer?" hint="Include main products, services, and target customers">
                  <textarea
                    className="form-input min-h-[100px] resize-y"
                    placeholder="e.g. A neighbourhood café serving specialty coffee and light meals, targeting local office workers and families…"
                    value={form.description}
                    onChange={e => patch({ description: e.target.value })}
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={goToStep2}
                className="btn btn-gold w-full rounded-xl"
                style={{ paddingTop: 14, paddingBottom: 14, fontSize: '0.9375rem' }}
              >
                Next — what&apos;s the challenge?
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="fade-up space-y-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide" style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
                  Step 2 of 2 · What&apos;s not working
                </div>
                <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--paper)' }}>
                  What&apos;s the challenge?
                </h1>
                <p className="mt-2 text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
                  The more detail you share, the more targeted your turnaround plan will be.
                </p>
              </div>

              <div className="rounded-2xl p-5 space-y-6" style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>

                {/* Problems multi-select */}
                <div>
                  <label className="ui-label mb-3 block">
                    What&apos;s the main problem? <span className="font-normal" style={{ color: 'var(--paper-4)' }}>(select all that apply)</span>
                  </label>
                  <div className="space-y-2">
                    {PROBLEM_OPTIONS.map(p => {
                      const checked = form.problems.includes(p)
                      return (
                        <label key={p}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all"
                          style={{
                            border: `1px solid ${checked ? 'var(--gold)' : 'var(--line-2)'}`,
                            background: checked ? 'var(--gold-soft)' : 'var(--ink-0)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProblem(p)}
                            className="h-4 w-4 rounded"
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span className="text-sm font-medium" style={{ color: checked ? 'var(--gold)' : 'var(--paper-2)' }}>{p}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Situation */}
                <Field
                  label="Describe the situation in your own words"
                  hint="What is happening, when it started, and how it affects the business"
                  error={errors.situation_description}
                >
                  <textarea
                    className={`form-input min-h-[120px] resize-y ${errors.situation_description ? 'border-red-300' : ''}`}
                    placeholder="e.g. Revenue has been dropping for 3 months since a new café opened 200m away. Our regulars still come but foot traffic from new customers has almost stopped…"
                    value={form.situation_description}
                    onChange={e => patch({ situation_description: e.target.value })}
                  />
                </Field>

                {/* What tried */}
                <Field label="What have you already tried?" hint="Optional — helps us avoid recommending things you've already done">
                  <textarea
                    className="form-input min-h-[80px] resize-y"
                    placeholder="e.g. We ran a discount campaign last month and updated our Instagram. Didn't move the needle…"
                    value={form.what_tried}
                    onChange={e => patch({ what_tried: e.target.value })}
                  />
                </Field>

                {/* Owner goal */}
                <div>
                  <label className="ui-label mb-3 block">What do you want to do next? *</label>
                  {errors.owner_goal && <p className="mb-2 text-xs text-red-600">{errors.owner_goal}</p>}
                  <div className="space-y-2">
                    {OWNER_GOAL_OPTIONS.map(g => {
                      const active = form.owner_goal === g
                      return (
                        <label key={g}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all"
                          style={{
                            border: `1px solid ${active ? 'var(--gold)' : 'var(--line-2)'}`,
                            background: active ? 'var(--gold-soft)' : 'var(--ink-0)',
                          }}
                        >
                          <input
                            type="radio"
                            name="owner_goal"
                            value={g}
                            checked={active}
                            onChange={() => patch({ owner_goal: g })}
                            className="h-4 w-4"
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span className="text-sm font-medium" style={{ color: active ? 'var(--gold)' : 'var(--paper-2)' }}>{g}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Monthly budget for changes" hint="Rough estimate">
                    <input
                      className="form-input"
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

              {/* Step 1 summary */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--ink-1)', border: '1px solid var(--line)' }}>
                <div className="mb-1.5 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--paper-4)' }}>Analysing</div>
                <div className="font-display font-semibold" style={{ color: 'var(--paper)' }}>{form.business_name || form.business_type}</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--paper-3)' }}>
                  {[
                    form.location_type === 'online' ? 'Online business' : place?.suburb ?? form.suburb,
                    form.state,
                    form.years_operating ? `${form.years_operating} operating` : null,
                  ].filter(Boolean).join(' · ')}
                </div>
                <button type="button" onClick={() => setStep(1)} className="mt-2 text-xs font-medium transition-colors"
                  style={{ color: 'var(--gold)' }}>
                  Edit details →
                </button>
              </div>

              {submitError && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-gold w-full rounded-xl disabled:opacity-60"
                style={{ paddingTop: 14, paddingBottom: 14, fontSize: '0.9375rem' }}
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
