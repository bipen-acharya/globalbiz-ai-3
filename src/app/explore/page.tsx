'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MapPin,
  Search,
  Star,
  X,
} from 'lucide-react'
import { AU_STATES, searchSuburbs } from '@/lib/australia-suburbs'
import { BUSINESS_TYPES } from '@/lib/australia-business-rules'
import { CompetitorMap } from '@/components/report/CompetitorMap'
import { priceLevelLabel } from '@/lib/utils'
import type { AustraliaSuburb, NearbyCompetitorData, NearbyPlace } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'globalbiz_explore_draft'
const RADIUS_OPTIONS = [1, 3, 5] as const

// ─── Types ────────────────────────────────────────────────────────────────────

type Draft = {
  businessType: string
  state: string
  suburb: AustraliaSuburb | null
  radiusKm: number
}

const DEFAULT_DRAFT: Draft = {
  businessType: '',
  state: '',
  suburb: null,
  radiusKm: 3,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function densityLabel(density: NearbyCompetitorData['competitor_density']) {
  const map = {
    low: 'Low competition',
    medium: 'Moderate competition',
    high: 'High competition',
    saturated: 'Saturated market',
  }
  return map[density] ?? density
}

function densityColor(density: NearbyCompetitorData['competitor_density']) {
  if (density === 'low') return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (density === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

function strengthBadge(strength?: NearbyPlace['competitor_strength']) {
  if (strength === 'strong') return 'bg-amber-100 text-amber-700'
  if (strength === 'weak') return 'bg-emerald-100 text-emerald-700'
  return 'bg-sky-100 text-sky-700'
}

function strengthLabel(strength?: NearbyPlace['competitor_strength']) {
  if (strength === 'strong') return 'Strong'
  if (strength === 'weak') return 'Weak'
  return 'Moderate'
}

function starsFill(rating: number | null) {
  if (rating === null) return null
  return Math.round(rating * 2) / 2
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Select({
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
      <select
        className="ui-input appearance-none pr-10"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
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
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync query text when external `selected` changes (e.g., on load from draft)
  useEffect(() => {
    if (selected) {
      setQuery(`${selected.suburb} ${selected.postcode}`)
    }
  }, [selected])

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handleOutside)
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (!state || value.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const hits = searchSuburbs(state, value.trim())
    setResults(hits)
    setOpen(hits.length > 0)
  }

  function handleSelect(s: AustraliaSuburb) {
    onSelect(s)
    setQuery(`${s.suburb} ${s.postcode}`)
    setOpen(false)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        <input
          ref={inputRef}
          className="ui-input pl-9 pr-10"
          placeholder={state ? 'Search suburb or postcode…' : 'Select a state first'}
          disabled={!state}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {results.map(s => (
            <li key={`${s.suburb}-${s.postcode}`}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
                onClick={() => handleSelect(s)}
              >
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

function BusinessCard({ place, index }: { place: NearbyPlace; index: number }) {
  const rating = starsFill(place.rating)
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-semibold text-slate-900 truncate">{place.name}</span>
          {place.competitor_strength && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${strengthBadge(place.competitor_strength)}`}>
              {strengthLabel(place.competitor_strength)}
            </span>
          )}
          {place.open_now !== null && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${place.open_now ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {place.open_now ? 'Open now' : 'Closed'}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {place.address && <span className="truncate max-w-xs">{place.address}</span>}
          {place.distance_km !== null && (
            <span className="shrink-0">{place.distance_km}km away</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {rating !== null && (
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              {place.rating?.toFixed(1)}
              {place.review_count !== null && (
                <span className="text-slate-400">({place.review_count})</span>
              )}
            </span>
          )}
          {place.price_level !== null && (
            <span className="text-slate-400">{priceLevelLabel(place.price_level)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [step, setStep] = useState<'form' | 'results'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NearbyCompetitorData | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Load draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Draft
        setDraft(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // ignore
    }
  }, [draft])

  function updateDraft(patch: Partial<Draft>) {
    setDraft(prev => ({ ...prev, ...patch }))
  }

  function validateForm(): boolean {
    if (!draft.businessType) {
      setFormError('Please select a business type.')
      return false
    }
    if (!draft.state) {
      setFormError('Please select a state.')
      return false
    }
    if (!draft.suburb) {
      setFormError('Please search and select a suburb.')
      return false
    }
    setFormError(null)
    return true
  }

  async function handleSubmit() {
    if (!validateForm()) return

    const { suburb, radiusKm, businessType } = draft
    if (!suburb) return

    setLoading(true)
    setError(null)
    setData(null)

    const params = new URLSearchParams({
      lat: String(suburb.lat),
      lng: String(suburb.lng),
      radius_km: String(radiusKm),
      business_type: businessType,
      suburb: suburb.suburb,
      state: suburb.state,
      postcode: suburb.postcode,
    })

    try {
      const res = await fetch(`/api/explore?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
      }
      const json = await res.json() as NearbyCompetitorData
      setData(json)
      setStep('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setStep('form')
    setData(null)
    setError(null)
  }

  // Build pre-fill URL for /analyze
  function buildAnalyzeUrl() {
    if (!draft.suburb) return '/analyze'
    const params = new URLSearchParams({
      state: draft.suburb.state,
      suburb: draft.suburb.suburb,
      postcode: draft.suburb.postcode,
      business_type: draft.businessType,
      radius_km: String(draft.radiusKm),
    })
    return `/analyze?${params.toString()}`
  }

  // ── Avg rating display ──────────────────────────────────────────────────────

  const avgRatingDisplay =
    data?.avg_rating !== null && data?.avg_rating !== undefined
      ? data.avg_rating.toFixed(1)
      : '—'

  const priceLevelDisplay =
    data?.avg_price_level !== null && data?.avg_price_level !== undefined
      ? priceLevelLabel(Math.round(data.avg_price_level))
      : '—'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-slate-900">
          GlobalBiz <span className="text-emerald-500">AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/analyze" className="ui-primary-btn">
            Generate report
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {step === 'form' && (
          <div className="fade-up">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                <Search className="h-3.5 w-3.5" />
                Free competitor lookup
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Find businesses in your area
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                See what&apos;s already operating near a suburb before you commit to a location or business type.
              </p>
            </div>

            {/* Form card */}
            <div className="ui-section space-y-6">
              {/* Business type */}
              <div>
                <label className="ui-label mb-2 block">Business type</label>
                <Select
                  options={BUSINESS_TYPES}
                  value={draft.businessType}
                  onChange={v => updateDraft({ businessType: v })}
                  placeholder="Select a business type…"
                />
              </div>

              {/* State */}
              <div>
                <label className="ui-label mb-2 block">State</label>
                <Select
                  options={AU_STATES}
                  value={draft.state}
                  onChange={v => updateDraft({ state: v, suburb: null })}
                  placeholder="Select a state…"
                />
              </div>

              {/* Suburb */}
              <div>
                <label className="ui-label mb-2 block">Suburb</label>
                <SuburbSearch
                  state={draft.state}
                  selected={draft.suburb}
                  onSelect={s => updateDraft({ suburb: s })}
                  onClear={() => updateDraft({ suburb: null })}
                />
                {draft.suburb && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      {draft.suburb.council}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      {draft.suburb.metro_zone}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      Pop. {draft.suburb.population_band}
                    </span>
                  </div>
                )}
              </div>

              {/* Radius */}
              <div>
                <label className="ui-label mb-2 block">Search radius</label>
                <div className="flex gap-3">
                  {RADIUS_OPTIONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateDraft({ radiusKm: r })}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                        draft.radiusKm === r
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation error */}
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Searching nearby businesses…
                  </>
                ) : (
                  <>
                    Show me what&apos;s there
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'results' && data && (
          <div className="fade-up space-y-6">
            {/* Back + header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change search
                </button>
                <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                  {draft.businessType} near {draft.suburb?.suburb}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {draft.radiusKm}km radius · {draft.suburb?.state}
                </p>
              </div>

              {/* Count badge */}
              <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center">
                <div className="font-display text-3xl font-bold text-emerald-700">
                  {data.total_found}
                </div>
                <div className="text-xs text-emerald-600">
                  {data.total_found === 1 ? 'business' : 'businesses'}
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="ui-info-box text-center">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Avg rating</div>
                <div className="font-display text-xl font-semibold text-slate-900">{avgRatingDisplay}</div>
              </div>
              <div className="ui-info-box text-center">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Avg price</div>
                <div className="font-display text-xl font-semibold text-slate-900">{priceLevelDisplay}</div>
              </div>
              <div className="ui-info-box text-center">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Strong</div>
                <div className="font-display text-xl font-semibold text-amber-600">{data.strong_count ?? 0}</div>
              </div>
              <div className="ui-info-box text-center">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">Weak</div>
                <div className="font-display text-xl font-semibold text-emerald-600">{data.weak_count ?? 0}</div>
              </div>
            </div>

            {/* Density badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${densityColor(data.competitor_density)}`}>
              <span className="h-2 w-2 rounded-full bg-current opacity-60" />
              {densityLabel(data.competitor_density)}
            </div>

            {/* Map */}
            {draft.suburb && (
              <CompetitorMap
                lat={draft.suburb.lat}
                lng={draft.suburb.lng}
                radiusKm={draft.radiusKm}
                competitors={data.competitors}
                suburb={draft.suburb.suburb}
                businessType={draft.businessType}
              />
            )}

            {/* Business list */}
            {data.competitors.length > 0 ? (
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-slate-900">
                  All businesses ({data.competitors.length})
                </h2>
                <div className="space-y-3">
                  {data.competitors.map((place, i) => (
                    <BusinessCard key={place.place_id} place={place} index={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="ui-info-box py-8 text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <div className="font-medium text-slate-900">No businesses found in this area</div>
                <div className="mt-1 text-sm text-slate-500">
                  Try a larger radius or different business type.
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-4 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Adjust search
                </button>
              </div>
            )}

            {/* CTA → full report */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="mb-1 font-display text-lg font-semibold text-emerald-900">
                This looks good — generate a full report
              </div>
              <p className="mb-4 text-sm leading-relaxed text-emerald-800">
                Get AI-powered founder analysis: viability score, opportunity gaps, setup checklist, and expansion guidance — pre-filled with your location and business type.
              </p>
              <Link
                href={buildAnalyzeUrl()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
              >
                Generate full report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
