'use client'

import type { NearbyCompetitorData, CompetitorThreat } from '@/types'
import { priceLevelLabel } from '@/lib/utils'

function DensityBadge({ density }: { density: NearbyCompetitorData['competitor_density'] }) {
  const styles: Record<string, string> = {
    low:       'border-emerald-200 bg-emerald-50 text-emerald-700',
    medium:    'border-amber-200 bg-amber-50 text-amber-700',
    high:      'border-blue-200 bg-blue-50 text-blue-700',
    saturated: 'border-red-200 bg-red-50 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize border ${styles[density] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {density}
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-slate-400">No rating</span>
  const full = Math.floor(rating)
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  )
}

interface Props {
  nearby: NearbyCompetitorData
  threats: CompetitorThreat[]
}

export function NearbyCompetitors({ nearby, threats }: Props) {
  const sourceLabel = nearby.source === 'google' ? 'Google Maps' : nearby.source === 'osm' ? 'OpenStreetMap' : 'Estimated'

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="ui-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="font-display font-semibold text-sm text-slate-900">
            Nearby competitor intelligence
          </span>
          <span className="text-xs text-slate-400">via {sourceLabel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs mb-1 text-slate-400">Total found</div>
            <div className={`font-display text-2xl font-bold ${nearby.total_found === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {nearby.total_found}
            </div>
            <div className="text-xs text-slate-400">within {nearby.search_radius_km}km</div>
          </div>
          <div>
            <div className="text-xs mb-1 text-slate-400">Avg. rating</div>
            <div className="font-display text-2xl font-bold text-amber-600">
              {nearby.avg_rating !== null ? nearby.avg_rating.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-slate-400">out of 5.0</div>
          </div>
          <div>
            <div className="text-xs mb-1 text-slate-400">Avg. price</div>
            <div className="font-display text-2xl font-bold text-slate-900">
              {nearby.avg_price_level !== null ? priceLevelLabel(Math.round(nearby.avg_price_level)) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 text-slate-400">Density</div>
            <div className="mt-1"><DensityBadge density={nearby.competitor_density} /></div>
          </div>
        </div>
        {(nearby.shopping_center_anchors?.length || nearby.food_hotspots?.length || nearby.local_retail_clusters?.length) ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(['Shopping centre anchors', 'Food hotspots', 'Retail clusters'] as const).map((title, idx) => {
              const data = [nearby.shopping_center_anchors, nearby.food_hotspots, nearby.local_retail_clusters][idx]
              const empty = ['No major shopping-centre anchor detected.', 'No food hotspot cluster detected.', 'No strong retail cluster detected.'][idx]
              return (
                <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="mb-1 font-medium text-slate-900">{title}</div>
                  <div className="text-slate-500">{data?.length ? data.slice(0, 3).join(', ') : empty}</div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Empty competitor state */}
      {nearby.competitors.length === 0 && (
        <div className="ui-card p-6 text-center border-emerald-200 bg-emerald-50">
          <div className="mb-2 text-2xl">🌿</div>
          <div className="font-display font-semibold mb-1 text-emerald-700">
            No direct competitors found — this could be an opportunity!
          </div>
          <p className="text-sm text-slate-600">
            The scan did not find any direct competitors in your area. This may indicate an underserved market or a new niche worth exploring.
          </p>
        </div>
      )}

      {/* Top threats */}
      {threats.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-sm mb-4 text-slate-900">
            Strong local players and opportunity gaps
          </div>
          <div className="space-y-3">
            {threats.map((t, i) => {
              const threatClasses = t.threat_level === 'strong'
                ? { wrap: 'border-amber-200 bg-amber-50', label: 'border-amber-200 bg-amber-100 text-amber-700' }
                : t.threat_level === 'established'
                ? { wrap: 'border-blue-200 bg-blue-50', label: 'border-blue-200 bg-blue-100 text-blue-700' }
                : t.threat_level === 'opportunity'
                ? { wrap: 'border-emerald-200 bg-emerald-50', label: 'border-emerald-200 bg-emerald-100 text-emerald-700' }
                : { wrap: 'border-slate-200 bg-slate-50', label: 'border-slate-200 bg-slate-100 text-slate-600' }
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${threatClasses.wrap}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-medium text-sm text-slate-900">{t.name}</div>
                      <div className="text-xs mt-0.5 text-slate-500">{t.address}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize border ${threatClasses.label}`}>
                        {t.threat_level === 'strong' ? 'Strong competitor' :
                          t.threat_level === 'established' ? 'Established player' :
                          t.threat_level === 'opportunity' ? 'Opportunity gap' :
                          'Needs differentiation'}
                      </span>
                      <StarRating rating={t.rating} />
                      {t.review_count !== null && (
                        <span className="text-xs text-slate-400">{t.review_count} reviews</span>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
                      <div className="font-medium mb-1 text-blue-700">What this tells you</div>
                      <div className="text-slate-600">{t.why_threat}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs">
                      <div className="font-medium mb-1 text-emerald-700">How to differentiate</div>
                      <div className="text-slate-600">{t.how_to_beat}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full competitor list */}
      {nearby.competitors.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-sm mb-4 text-slate-900">
            All {nearby.competitors.length} nearby businesses
          </div>
          <div className="space-y-0">
            {nearby.competitors.map((c, i) => (
              <div
                key={c.place_id}
                className="flex items-center justify-between gap-3 py-2.5 transition-colors"
                style={{ borderBottom: i < nearby.competitors.length - 1 ? '1px solid #E2E8F0' : 'none' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs w-5 flex-shrink-0 text-slate-400">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm truncate text-slate-900">{c.name}</div>
                    <div className="text-xs truncate text-slate-400">{c.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  {c.rating !== null && (
                    <span className="font-medium text-amber-600">{c.rating.toFixed(1)}★</span>
                  )}
                  {c.distance_km !== null && (
                    <span className="text-slate-400">{c.distance_km}km</span>
                  )}
                  {c.open_now !== null && (
                    <span className={c.open_now ? 'text-emerald-600' : 'text-slate-400'}>
                      {c.open_now ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
