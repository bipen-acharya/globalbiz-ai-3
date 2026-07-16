'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ArrowUpRight, ChevronDown, MapPin, Search, Star, X,
} from 'lucide-react'
import { AU_STATES, searchSuburbs } from '@/lib/australia-suburbs'
import { BUSINESS_TYPES } from '@/lib/australia-business-rules'
import { CompetitorMap } from '@/components/report/CompetitorMap'
import { priceLevelLabel } from '@/lib/utils'
import type { AustraliaSuburb, NearbyCompetitorData, NearbyPlace } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'globalbiz_explore_draft'
const RADIUS_OPTIONS = [1, 3, 5] as const

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

function densityLabel(d: NearbyCompetitorData['competitor_density']) {
  return ({ low: 'Low competition', medium: 'Moderate', high: 'High', saturated: 'Saturated' } as const)[d] ?? d
}

function strengthLabel(s?: NearbyPlace['competitor_strength']) {
  if (s === 'strong') return 'Strong'
  if (s === 'weak') return 'Weak'
  return 'Moderate'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [step, setStep] = useState<'form' | 'results'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NearbyCompetitorData | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDraft(JSON.parse(raw) as Draft)
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)) } catch {}
  }, [draft])

  function update(patch: Partial<Draft>) { setDraft(prev => ({ ...prev, ...patch })) }

  function validate(): boolean {
    if (!draft.businessType) return setFormError('Please select a business type.'), false
    if (!draft.state)        return setFormError('Please select a state.'), false
    if (!draft.suburb)       return setFormError('Please search and select a suburb.'), false
    setFormError(null); return true
  }

  async function submit() {
    if (!validate() || !draft.suburb) return
    setLoading(true); setError(null); setData(null)
    const params = new URLSearchParams({
      lat: String(draft.suburb.lat),
      lng: String(draft.suburb.lng),
      radius_km: String(draft.radiusKm),
      business_type: draft.businessType,
      suburb: draft.suburb.suburb,
      state: draft.suburb.state,
      postcode: draft.suburb.postcode,
    })
    try {
      const res = await fetch(`/api/explore?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
      }
      const json = await res.json() as NearbyCompetitorData
      setData(json); setStep('results'); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function analyzeUrl(): string {
    if (!draft.suburb) return '/analyze'
    return `/analyze?${new URLSearchParams({
      state: draft.suburb.state,
      suburb: draft.suburb.suburb,
      postcode: draft.suburb.postcode,
      business_type: draft.businessType,
      radius_km: String(draft.radiusKm),
    })}`
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-1)' }}>
      {/* ── Nav ── */}
      <nav className="nav-blur sticky top-0 z-50">
        <div className="container-wide flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full" style={{ background: 'var(--gold)' }} />
            <span className="font-semibold tracking-tight">GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              <ArrowLeft size={14} /> Home
            </Link>
            <Link href={analyzeUrl()} className="btn btn-gold" style={{ padding: '8px 18px', fontSize: 13 }}>
              Generate report <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        {step === 'form' && (
          <div className="anim-fade-up">
            {/* Header */}
            <div className="mb-8">
              <div className="tag tag-gold mb-4">
                <Search size={11} /> Free competitor lookup
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--paper)' }}>
                Find businesses in your area
              </h1>
              <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--paper-3)' }}>
                See what&apos;s already operating near a suburb before you commit to a location or business type.
              </p>
            </div>

            {/* Form */}
            <div className="surface p-6 space-y-5">
              <FieldRow label="Business type">
                <Select
                  options={BUSINESS_TYPES}
                  value={draft.businessType}
                  onChange={v => update({ businessType: v })}
                  placeholder="Select a business type"
                />
              </FieldRow>

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldRow label="State">
                  <Select
                    options={AU_STATES}
                    value={draft.state}
                    onChange={v => update({ state: v, suburb: null })}
                    placeholder="Select"
                  />
                </FieldRow>

                <FieldRow label="Suburb">
                  <SuburbSearch
                    state={draft.state}
                    selected={draft.suburb}
                    onSelect={s => update({ suburb: s })}
                    onClear={() => update({ suburb: null })}
                  />
                </FieldRow>
              </div>

              {draft.suburb && (
                <div className="flex flex-wrap gap-2 anim-fade-in">
                  <span className="tag">{draft.suburb.council}</span>
                  <span className="tag">{draft.suburb.metro_zone}</span>
                  <span className="tag">Pop. {draft.suburb.population_band}</span>
                </div>
              )}

              <FieldRow label="Search radius">
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update({ radiusKm: r })}
                      className="flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all"
                      style={
                        draft.radiusKm === r
                          ? { background: 'var(--gold)', borderColor: 'var(--gold)', color: '#fff' }
                          : { background: 'var(--ink-2)', borderColor: 'var(--line-2)', color: 'var(--paper-2)' }
                      }
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </FieldRow>

              {(formError || error) && (
                <div className="rounded-lg border px-4 py-2.5 text-sm anim-fade-in"
                  style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.05)', color: 'var(--danger)' }}>
                  {formError ?? error}
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="btn btn-gold w-full mt-2"
                style={{ paddingTop: 14, paddingBottom: 14 }}
              >
                {loading ? (<><span className="spinner" /> Searching nearby…</>) :
                  (<>Show me what&apos;s there <ArrowUpRight size={15} /></>)}
              </button>
            </div>

            <p className="mt-4 text-center text-xs" style={{ color: 'var(--paper-4)' }}>
              Pulls real Google Maps data — usually 3–5 seconds.
            </p>
          </div>
        )}

        {step === 'results' && data && (
          <div className="anim-fade-up space-y-6">
            <button
              onClick={() => { setStep('form'); setData(null); setError(null) }}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--paper-3)' }}
            >
              <ArrowLeft size={14} /> Change search
            </button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--paper)' }}>
                  {draft.businessType} near {draft.suburb?.suburb}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--paper-3)' }}>
                  {draft.radiusKm}km radius · {draft.suburb?.state}
                </p>
              </div>
              <div className="shrink-0 rounded-xl px-5 py-3 text-center" style={{ background: 'var(--gold-soft)', border: '1px solid rgba(79,70,229,0.20)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{data.total_found}</div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                  {data.total_found === 1 ? 'business' : 'businesses'}
                </div>
              </div>
            </div>

            {/* Compact stats */}
            <div className="grid grid-cols-4 gap-2">
              <Stat label="Avg rating" value={data.avg_rating != null ? data.avg_rating.toFixed(1) : '—'} />
              <Stat label="Avg price"  value={data.avg_price_level != null ? priceLevelLabel(Math.round(data.avg_price_level)) : '—'} />
              <Stat label="Strong"     value={String(data.strong_count ?? 0)} accent="warn" />
              <Stat label="Weak"       value={String(data.weak_count ?? 0)} accent="ok" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: 'var(--line-2)', background: 'var(--ink-2)', color: 'var(--paper-2)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
              {densityLabel(data.competitor_density)}
            </div>

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

            {data.competitors.length > 0 ? (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--paper-3)' }}>
                  Nearby ({data.competitors.length})
                </h2>
                <div className="space-y-2">
                  {data.competitors.map((p, i) => <BusinessRow key={p.place_id} place={p} index={i} />)}
                </div>
              </div>
            ) : (
              <div className="surface px-6 py-10 text-center">
                <MapPin size={20} className="mx-auto mb-2" style={{ color: 'var(--paper-4)' }} />
                <div className="text-sm font-medium" style={{ color: 'var(--paper)' }}>No businesses found</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--paper-3)' }}>Try a larger radius or different type.</div>
              </div>
            )}

            {/* CTA */}
            <div className="surface p-6">
              <div className="text-base font-semibold" style={{ color: 'var(--paper)' }}>
                Ready to validate this opportunity?
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--paper-3)' }}>
                Run a full feasibility report — viability score, gaps, and a 90-day plan, pre-filled with this location.
              </p>
              <Link href={analyzeUrl()} className="btn btn-gold mt-4">
                Generate full report <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Inner components ─────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--paper-3)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Select({
  options, value, onChange, placeholder = 'Select…',
}: { options: readonly string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        className="input appearance-none pr-10"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--paper-3)' }} />
    </div>
  )
}

function SuburbSearch({
  state, selected, onSelect, onClear,
}: { state: string; selected: AustraliaSuburb | null; onSelect: (s: AustraliaSuburb) => void; onClear: () => void }) {
  const [query, setQuery] = useState(selected ? `${selected.suburb} ${selected.postcode}` : '')
  const [results, setResults] = useState<AustraliaSuburb[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selected) setQuery(`${selected.suburb} ${selected.postcode}`)
  }, [selected])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  function handleChange(v: string) {
    setQuery(v)
    if (!state || v.trim().length < 2) { setResults([]); setOpen(false); return }
    const hits = searchSuburbs(state, v.trim())
    setResults(hits)
    setOpen(hits.length > 0)
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <MapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: state ? 'var(--gold)' : 'var(--paper-4)' }} />
        <input
          ref={inputRef}
          className="input pl-9 pr-9"
          placeholder={state ? 'Search suburb or postcode…' : 'Select a state first'}
          disabled={!state}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); onClear(); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors"
            style={{ color: 'var(--paper-4)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl" style={{ background: 'var(--ink-2)', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-lg)' }}>
          {results.map(s => (
            <li key={`${s.suburb}-${s.postcode}`}>
              <button
                type="button"
                onClick={() => { onSelect(s); setQuery(`${s.suburb} ${s.postcode}`); setOpen(false) }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--ink-3)]"
              >
                <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
                <span>
                  <span className="font-medium" style={{ color: 'var(--paper)' }}>{s.suburb}</span>
                  <span className="ml-2" style={{ color: 'var(--paper-4)' }}>{s.postcode}</span>
                  <span className="ml-1" style={{ color: 'var(--paper-4)' }}>· {s.council}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'warn' | 'ok' }) {
  const color = accent === 'warn' ? 'var(--warn)' : accent === 'ok' ? 'var(--ok)' : 'var(--paper)'
  return (
    <div className="surface px-3 py-3 text-center">
      <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--paper-4)' }}>{label}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color }}>{value}</div>
    </div>
  )
}

function BusinessRow({ place, index }: { place: NearbyPlace; index: number }) {
  return (
    <div className="surface flex items-start gap-3 p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
           style={{ background: 'var(--ink-1)', color: 'var(--paper-3)' }}>
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold" style={{ color: 'var(--paper)' }}>{place.name}</span>
          {place.competitor_strength && (
            <span className="tag" style={{ fontSize: 10 }}>{strengthLabel(place.competitor_strength)}</span>
          )}
          {place.open_now != null && (
            <span className="tag" style={{ fontSize: 10, color: place.open_now ? 'var(--ok)' : 'var(--paper-3)' }}>
              {place.open_now ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--paper-3)' }}>
          {place.address && <span className="truncate">{place.address}</span>}
          {place.distance_km != null && <span>{place.distance_km}km</span>}
          {place.rating != null && (
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--paper-2)' }}>
              <Star size={11} className="fill-current" style={{ color: 'var(--gold)' }} />
              {place.rating.toFixed(1)}
              {place.review_count != null && <span style={{ color: 'var(--paper-4)' }}>({place.review_count})</span>}
            </span>
          )}
          {place.price_level != null && <span>{priceLevelLabel(place.price_level)}</span>}
        </div>
      </div>
    </div>
  )
}
