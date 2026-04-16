'use client'

import type { NearbyCompetitorData, CompetitorThreat } from '@/types'
import { priceLevelLabel } from '@/lib/utils'

function DensityBadge({ density }: { density: NearbyCompetitorData['competitor_density'] }) {
  const map = {
    low:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium:   'bg-amber-50 text-amber-700 border-amber-200',
    high:     'bg-sky-50 text-sky-700 border-sky-200',
    saturated:'bg-zinc-100 text-zinc-700 border-zinc-200',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${map[density]}`}>
      {density}
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-slate-400 text-xs">No rating</span>
  const full = Math.floor(rating)
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
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
            <span className="font-display font-semibold text-slate-900 text-sm">
              Nearby competitor intelligence
            </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">via {sourceLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Total found</div>
            <div className="text-2xl font-display font-bold text-slate-900">{nearby.total_found}</div>
            <div className="text-xs text-slate-500">within {nearby.search_radius_km}km</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Avg. rating</div>
            <div className="text-2xl font-display font-bold text-amber-400">
              {nearby.avg_rating !== null ? nearby.avg_rating.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-slate-500">out of 5.0</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Avg. price</div>
            <div className="text-2xl font-display font-bold text-slate-900">
              {nearby.avg_price_level !== null ? priceLevelLabel(Math.round(nearby.avg_price_level)) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Density</div>
            <div className="mt-1"><DensityBadge density={nearby.competitor_density} /></div>
          </div>
        </div>
        {(nearby.shopping_center_anchors?.length || nearby.food_hotspots?.length || nearby.local_retail_clusters?.length) ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="mb-1 font-medium text-slate-900">Shopping centre anchors</div>
              {nearby.shopping_center_anchors?.length ? nearby.shopping_center_anchors.slice(0, 3).join(', ') : 'No major shopping-centre anchor detected in the scan.'}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="mb-1 font-medium text-slate-900">Food hotspots</div>
              {nearby.food_hotspots?.length ? nearby.food_hotspots.slice(0, 3).join(', ') : 'No obvious food hotspot cluster detected in the scan.'}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="mb-1 font-medium text-slate-900">Retail clusters</div>
              {nearby.local_retail_clusters?.length ? nearby.local_retail_clusters.slice(0, 3).join(', ') : 'No strong retail cluster surfaced from the current scan.'}
            </div>
          </div>
        ) : null}
      </div>

      {/* Top threats */}
      {threats.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-slate-900 text-sm mb-4">
            Strong local players and opportunity gaps
          </div>
          <div className="space-y-3">
            {threats.map((t, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.address}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize
                      ${t.threat_level === 'strong' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        t.threat_level === 'established' ? 'text-sky-700 bg-sky-50 border-sky-200' :
                        t.threat_level === 'opportunity' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        'text-zinc-700 bg-zinc-100 border-zinc-200'}`}>
                      {t.threat_level === 'strong' ? 'Strong competitor' :
                        t.threat_level === 'established' ? 'Established local player' :
                        t.threat_level === 'opportunity' ? 'Opportunity gap' :
                        'Needs differentiation'}
                    </span>
                    <StarRating rating={t.rating} />
                    {t.review_count !== null && (
                      <span className="text-xs text-slate-500">{t.review_count} reviews</span>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs">
                    <div className="text-sky-700 font-medium mb-1">What this tells you</div>
                    <div className="text-slate-600">{t.why_threat}</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
                    <div className="text-emerald-700 font-medium mb-1">How to differentiate</div>
                    <div className="text-slate-600">{t.how_to_beat}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full competitor list */}
      {nearby.competitors.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-slate-900 text-sm mb-4">
            All {nearby.competitors.length} nearby businesses
          </div>
          <div className="space-y-2">
            {nearby.competitors.map((c, i) => (
              <div key={c.place_id} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-400 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-900 truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  {c.rating !== null && (
                    <span className="text-amber-400 font-medium">{c.rating.toFixed(1)}★</span>
                  )}
                  {c.distance_km !== null && (
                    <span className="text-slate-500">{c.distance_km}km</span>
                  )}
                  {c.open_now !== null && (
                    <span className={c.open_now ? 'text-emerald-600' : 'text-zinc-500'}>
                      {c.open_now ? 'Open now' : 'Currently closed'}
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
