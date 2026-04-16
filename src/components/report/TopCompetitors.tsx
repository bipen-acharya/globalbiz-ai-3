'use client'

import type { NearbyPlace } from '@/types'
import { priceLevelLabel } from '@/lib/utils'

interface Props {
  competitors: NearbyPlace[]
  radiusKm: number
}

function RatingBar({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-400">No rating</span>
  const pct = (rating / 5) * 100
  const color = rating >= 4.2 ? '#f59e0b' : rating >= 3.5 ? '#2563eb' : '#10b981'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, background: color }} className="h-full rounded-full transition-all duration-700" />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{rating.toFixed(1)}★</span>
    </div>
  )
}

export function TopCompetitors({ competitors, radiusKm }: Props) {
  const sorted = [...competitors].sort((a, b) => {
    const scoreA = (a.rating ?? 0) * 10 + Math.log10(Math.max(1, a.review_count ?? 1)) * 3
    const scoreB = (b.rating ?? 0) * 10 + Math.log10(Math.max(1, b.review_count ?? 1)) * 3
    return scoreB - scoreA
  })

  const top5    = sorted.slice(0, 5)
  const weak    = competitors.filter(c => c.rating !== null && c.rating < 3.5)
                             .sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))
  const closed  = competitors.filter(c => c.open_now === false)
  const allClose= closed.length > 0 && closed.length / Math.max(1, competitors.length) > 0.4

  return (
    <div className="space-y-5">
      {/* Top 5 strongest */}
      <div className="ui-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-semibold text-slate-900 text-sm">Top {top5.length} strongest local players</span>
          <span className="text-xs text-slate-500">within {radiusKm}km</span>
        </div>
        <div className="space-y-3">
          {top5.map((c, i) => (
            <div key={c.place_id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                ${i === 0 ? 'bg-amber-50 text-amber-700' :
                  i === 1 ? 'bg-sky-50 text-sky-700' :
                  'bg-white text-slate-500 border border-slate-200'}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.address}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {c.distance_km !== null && <div className="text-xs text-slate-500">{c.distance_km}km</div>}
                    {c.open_now !== null && (
                      <div className={`text-xs font-medium ${c.open_now ? 'text-emerald-600' : 'text-zinc-500'}`}>
                        {c.open_now ? 'Open now' : 'Currently closed'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <RatingBar rating={c.rating} />
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  {c.review_count !== null && <span className="text-xs text-slate-500">{c.review_count.toLocaleString()} reviews</span>}
                  {c.price_level !== null && <span className="text-xs text-slate-500">{priceLevelLabel(c.price_level)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak competitors — opportunity */}
      {weak.length > 0 && (
        <div className="ui-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="font-display font-semibold text-slate-900 text-sm">
              {weak.length} opportunity gap{weak.length > 1 ? 's' : ''} in the local market
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">These operators have weaker review signals, which usually means there is room for a better-positioned offer to win trust faster.</p>
          <div className="space-y-2">
            {weak.slice(0, 4).map(c => (
              <div key={c.place_id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-sm text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.address}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-emerald-600">{c.rating?.toFixed(1)}★</div>
                  {c.review_count !== null && <div className="text-xs text-slate-500">{c.review_count} reviews</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours opportunity */}
      {allClose && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg flex-shrink-0">⏰</span>
            <div>
              <div className="font-display font-semibold text-slate-900 text-sm mb-1">Hours opportunity detected</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {closed.length} of {competitors.length} nearby competitors are currently closed. This radius has a consistent opening-hours gap — businesses that operate when others don't capture demand with zero competition.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {closed.slice(0, 4).map(c => (
                  <span key={c.place_id} className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                    {c.name.split(' ').slice(0, 2).join(' ')} — closed
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
