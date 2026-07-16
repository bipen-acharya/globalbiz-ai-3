'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowUpRight, ChevronDown, Globe, Loader2, MapPin,
} from 'lucide-react'
import { SiteHeader, BackLink } from '@/components/SiteHeader'
import { AddressPicker } from '@/components/AddressPicker'
import type { PlaceResult } from '@/components/AddressPicker'
import LoadingOverlay from '@/components/analyze/LoadingOverlay'

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

function budgetToNumber(b: string): number {
  const map: Record<string, number> = {
    'Under $5K': 4000, '$5K–$20K': 12000, '$20K–$50K': 35000,
    '$50K–$100K': 75000, '$100K+': 150000,
  }
  return map[b] ?? 10000
}

type BusinessType = 'physical' | 'online'
type Errors = Record<string, string>

interface FormState {
  businessName: string
  description: string
  businessType: BusinessType
  businessCategory: string
  customBusinessType: string
  place: PlaceResult | null
  radiusKm: number
  websiteUrl: string
  googleBizUrl: string
  country: string
  onlineState: string
  targetCustomers: string[]
  customTargetCustomer: string
  teamSize: string
  launchTimeframe: string
  budgetRange: string
  avgPriceRange: string
}

const DEFAULT_FORM: FormState = {
  businessName: '', description: '', businessType: 'physical',
  businessCategory: '', customBusinessType: '',
  place: null, radiusKm: 10,
  websiteUrl: '', googleBizUrl: '', country: 'Australia', onlineState: 'NSW',
  targetCustomers: [], customTargetCustomer: '',
  teamSize: 'Solo', launchTimeframe: '3–6 months',
  budgetRange: '$5K–$20K', avgPriceRange: '$15–$50',
}

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULT_FORM,
    ...(searchParams.get('idea')     && { businessName: searchParams.get('idea')! }),
    ...(searchParams.get('category') && { businessCategory: searchParams.get('category')! }),
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapeBanner, setScrapeBanner] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  async function handleWebsiteBlur() {
    if (!form.websiteUrl.trim() || scraping) return
    setScraping(true)
    try {
      const res = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.websiteUrl }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setForm(f => ({
          ...f,
          businessName:     f.businessName     || data.data.businessName || f.businessName,
          description:      f.description      || data.data.description  || f.description,
          businessCategory: f.businessCategory || data.data.category     || f.businessCategory,
        }))
        setScrapeBanner(true)
      }
    } catch {}
    setScraping(false)
  }

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

  function buildPayload() {
    const isOnline = form.businessType === 'online'
    const budget = budgetToNumber(form.budgetRange)

    return {
      user_goal_mode: 'start_new',
      business_name: form.businessName || 'My Business',
      business_concept: form.description,
      products_services: form.description,
      business_type: form.businessCategory === 'Others'
        ? (form.customBusinessType || 'Other')
        : (form.businessCategory || 'Other'),
      business_type_other: form.businessCategory === 'Others' ? form.customBusinessType : '',
      business_model_type: form.businessType,
      state: isOnline ? (form.onlineState || 'NSW') : (form.place?.state ?? 'NSW'),
      suburb: isOnline ? '' : (form.place?.suburb ?? ''),
      city: isOnline ? '' : (form.place?.suburb ?? ''),
      postcode: form.place?.postcode ?? '',
      lat: form.place?.lat ?? null,
      lng: form.place?.lng ?? null,
      radius_km: form.radiusKm,
      website_url: form.websiteUrl,
      google_business_profile_url: form.googleBizUrl,
      delivery_coverage: isOnline ? 'Australia-wide' : '',
      target_market: isOnline ? form.country || 'Australia' : '',
      target_customers: form.targetCustomers.length > 0
        ? form.targetCustomers.map(c =>
            c === 'Other' && form.customTargetCustomer ? form.customTargetCustomer : c)
        : ['General public'],
      staff_count: form.teamSize === 'Solo' ? 1 : form.teamSize === '2–5' ? 3 : form.teamSize === '6–20' ? 10 : 25,
      startup_budget: String(budget),
      expected_revenue: String(Math.round(budget * 0.25)),
      avg_price_range: form.avgPriceRange || '$15–$50',
      launch_timeline: form.launchTimeframe || '3–6 months',
      growth_goal: 'Grow revenue',
      break_even_expectation: '12–18 months',
      risk_tolerance: 'medium',
      current_monthly_revenue: '',
      current_challenges: [],
      growth_strategy_type: '',
      current_location_suburb: isOnline ? 'Online' : (form.place?.suburb ?? ''),
    }
  }

  async function submit() {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      // scroll to first error
      requestAnimationFrame(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.error === 'TOTAL_LIMIT_REACHED') {
          router.push('/coming-soon')
          return
        }
        if (data.error === 'DAILY_LIMIT_REACHED') {
          setErrors({ _apiError: 'Today\'s free report limit has been reached. Please try again tomorrow.' })
          setSubmitting(false)
          return
        }
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
    <div className="min-h-screen" style={{ background: 'var(--ink-0)', color: 'var(--paper)' }}>
      <SiteHeader />

      <main className="container-text pt-12 pb-24">
        <header className="anim-fade-up">
          <BackLink href="/" label="Back to home" />
          <div className="eyebrow">Founder report · Free</div>
          <h1 className="display mt-6" style={{ fontSize: 'var(--t-h1)' }}>
            Tell us about<br /><em>the business</em>.
          </h1>
          <p className="mt-5 max-w-lg" style={{ color: 'var(--paper-2)' }}>
            We&apos;ll pull real competitor data, run feasibility scoring, and return a full report in about three minutes.
          </p>
        </header>

        <div className="mt-12 space-y-10">
          {/* ── Section 01: Basics ── */}
          <Section number="01" title="Business basics">
            <Field label="Business name" hint="Optional">
              <input
                className="input"
                placeholder="e.g. Adelaide Bread Co."
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
              />
            </Field>

            <Field label="Category" required error={errors.businessCategory}>
              <div className="relative">
                <select
                  className="input pr-10 appearance-none"
                  value={form.businessCategory}
                  onChange={e => set('businessCategory', e.target.value)}
                  data-error={!!errors.businessCategory}
                >
                  <option value="">Select a category…</option>
                  {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--paper-3)' }} />
              </div>
              {form.businessCategory === 'Others' && (
                <input
                  className="input mt-3"
                  placeholder="e.g. Mobile food truck, Pop-up store…"
                  value={form.customBusinessType}
                  onChange={e => set('customBusinessType', e.target.value)}
                  data-error={!!errors.customBusinessType}
                />
              )}
            </Field>

            <Field label="What does the business do?" required error={errors.description}>
              <textarea
                rows={3}
                className="input resize-none"
                placeholder="A specialty coffee shop focused on single-origin beans and fast weekday service for office workers."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                data-error={!!errors.description}
              />
            </Field>

            <Field label="Operating model" required>
              <div className="grid grid-cols-2 gap-3">
                <Toggle
                  active={form.businessType === 'physical'}
                  onClick={() => set('businessType', 'physical')}
                  icon={<MapPin size={16} />}
                  label="Physical / Local"
                />
                <Toggle
                  active={form.businessType === 'online'}
                  onClick={() => set('businessType', 'online')}
                  icon={<Globe size={16} />}
                  label="Online / Digital"
                />
              </div>
            </Field>
          </Section>

          {/* ── Section 02: Location ── */}
          <Section number="02" title="Location">
            {form.businessType === 'physical' && (
              <>
                <Field label="Business address" required error={errors.place}>
                  <AddressPicker
                    onSelect={p => set('place', p)}
                    onClear={() => set('place', null)}
                    selected={form.place}
                    error={errors.place}
                  />
                </Field>
                <Field label="Search radius for competitors">
                  <ChipGroup
                    options={RADIUS_OPTIONS.map(r => ({ label: `${r} km`, value: r }))}
                    value={form.radiusKm}
                    onChange={v => set('radiusKm', v)}
                  />
                </Field>
              </>
            )}

            {form.businessType === 'online' && (
              <>
                {scrapeBanner && (
                  <div className="anim-fade-in flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'rgba(109,191,138,0.4)', background: 'rgba(109,191,138,0.08)', color: 'var(--ok)' }}>
                    <span className="block h-1.5 w-1.5 mt-2 rounded-full" style={{ background: 'var(--ok)' }} />
                    We read your website — feel free to edit the fields.
                  </div>
                )}
                <Field label="Business website" required error={errors.websiteUrl}>
                  <div className="relative">
                    <input
                      type="url"
                      className="input"
                      placeholder="https://yourbusiness.com.au"
                      value={form.websiteUrl}
                      onChange={e => set('websiteUrl', e.target.value)}
                      onBlur={handleWebsiteBlur}
                      data-error={!!errors.websiteUrl}
                    />
                    {scraping && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs" style={{ color: 'var(--paper-3)' }}>
                        <Loader2 size={14} className="animate-spin" />
                        Reading…
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Google Business Profile" hint="Optional">
                  <input
                    type="url"
                    className="input"
                    placeholder="https://g.page/your-business"
                    value={form.googleBizUrl}
                    onChange={e => set('googleBizUrl', e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Country">
                    <SelectInput value={form.country} onChange={v => set('country', v)} options={['Australia', 'New Zealand', 'United States', 'United Kingdom', 'Other']} />
                  </Field>
                  {form.country === 'Australia' && (
                    <Field label="State">
                      <SelectInput value={form.onlineState} onChange={v => set('onlineState', v)} options={[...AU_STATES]} />
                    </Field>
                  )}
                </div>
              </>
            )}
          </Section>

          {/* ── Section 03: Customers & goals ── */}
          <Section number="03" title="Customers & goals">
            <Field label="Target customers" required hint="Select all that apply" error={errors.targetCustomers}>
              <div className="flex flex-wrap gap-2" data-error={!!errors.targetCustomers}>
                {TARGET_CUSTOMER_OPTIONS.map(opt => {
                  const selected = form.targetCustomers.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        targetCustomers: f.targetCustomers.includes(opt)
                          ? f.targetCustomers.filter(c => c !== opt)
                          : [...f.targetCustomers, opt],
                      }))}
                      className={selected ? 'chip chip-active' : 'chip'}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {form.targetCustomers.includes('Other') && (
                <input
                  className="input mt-4"
                  placeholder="Describe your target customers"
                  value={form.customTargetCustomer}
                  onChange={e => set('customTargetCustomer', e.target.value)}
                  data-error={!!errors.customTargetCustomer}
                />
              )}
            </Field>

            <Field label="Average price per product / service">
              <ChipGroup
                options={PRICE_OPTIONS.map(p => ({ label: p, value: p }))}
                value={form.avgPriceRange}
                onChange={v => set('avgPriceRange', v)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Team size">
                <SelectInput value={form.teamSize} onChange={v => set('teamSize', v)} options={[...TEAM_SIZE_OPTIONS]} />
              </Field>
              <Field label="Planned launch">
                <SelectInput value={form.launchTimeframe} onChange={v => set('launchTimeframe', v)} options={[...LAUNCH_OPTIONS]} />
              </Field>
            </div>

            <Field label="Budget range">
              <ChipGroup
                options={BUDGET_OPTIONS.map(b => ({ label: b, value: b }))}
                value={form.budgetRange}
                onChange={v => set('budgetRange', v)}
              />
            </Field>
          </Section>

          {/* API error */}
          {errors._apiError && (
            <div className="rounded-xl border px-5 py-4 text-sm anim-fade-in" style={{ borderColor: 'rgba(226,107,107,0.4)', background: 'rgba(226,107,107,0.08)', color: 'var(--danger)' }}>
              {errors._apiError}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button onClick={submit} className="btn btn-gold w-full justify-center py-4 text-base">
              Generate the report <ArrowUpRight size={18} />
            </button>
            <p className="mt-4 text-center text-xs" style={{ color: 'var(--paper-4)' }}>
              {form.businessType === 'physical'
                ? 'We&apos;ll find real competitors via Google Maps within your radius.'
                : 'We&apos;ll analyse your website and benchmark against similar businesses.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal components
// ─────────────────────────────────────────────────────────────────────────────

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="anim-fade-up">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-display text-2xl" style={{ color: 'var(--gold)' }}>{number}</span>
        <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
        <h2 className="font-display text-xl" style={{ color: 'var(--paper)' }}>{title}</h2>
      </div>
      <div className="surface p-6 space-y-5">
        {children}
      </div>
    </section>
  )
}

function Field({ label, hint, required, error, children }: {
  label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="label">
          {label}{required && <span style={{ color: 'var(--gold)' }}> *</span>}
        </label>
        {hint && <span className="text-xs" style={{ color: 'var(--paper-4)' }}>{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}

function Toggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-medium transition-all"
      style={{
        background: active ? 'var(--ink-3)' : 'var(--ink-1)',
        border: `1px solid ${active ? 'var(--gold)' : 'var(--line-2)'}`,
        color: active ? 'var(--paper)' : 'var(--paper-2)',
        boxShadow: active ? '0 0 0 4px var(--gold-soft)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function ChipGroup<T extends string | number>({ options, value, onChange }: {
  options: { label: string; value: T }[]; value: T; onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={value === opt.value ? 'chip chip-active' : 'chip'}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select className="input pr-10 appearance-none" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--paper-3)' }} />
    </div>
  )
}
