'use client'

import type { NearbyCompetitorData } from '@/types'
import { priceLevelLabel } from '@/lib/utils'

interface Props {
  nearby: NearbyCompetitorData
}

export function CompetitorInsights({ nearby }: Props) {
  const { competitors } = nearby

  // Price distribution
  const priceDist = [0, 0, 0, 0, 0]
  competitors.forEach(c => { if (c.price_level !== null) priceDist[c.price_level]++ })
  const maxPrice = Math.max(...priceDist, 1)

  // Rating distribution
  const ratingBands = [
    { label: '4.5–5.0★', min: 4.5, max: 5.0, color: '#ef4444' },
    { label: '4.0–4.4★', min: 4.0, max: 4.5, color: '#f97316' },
    { label: '3.5–3.9★', min: 3.5, max: 4.0, color: '#f59e0b' },
    { label: 'Below 3.5★', min: 0,  max: 3.5, color: '#22c55e' },
  ]
  const ratingCounts = ratingBands.map(b =>
    competitors.filter(c => c.rating !== null && c.rating >= b.min && c.rating < b.max).length
  )
  const maxRating = Math.max(...ratingCounts, 1)

  // Review velocity
  const highReview = competitors.filter(c => c.review_count !== null && c.review_count > 200)
  const noReview   = competitors.filter(c => c.review_count === 0 || c.review_count === null)

  // Open/closed ratio
  const openCount   = competitors.filter(c => c.open_now === true).length
  const closedCount = competitors.filter(c => c.open_now === false).length

  return (
    <div className="space-y-5">
      {/* Pricing distribution */}
      <div className="ui-card p-5">
        <div className="font-display font-semibold text-slate-900 text-sm mb-1">Pricing distribution in radius</div>
        <p className="text-xs text-slate-500 mb-4">How nearby competitors are priced, which helps reveal where the market gap may sit.</p>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(level => (
            <div key={level} className="flex items-center gap-3">
              <div className="text-xs text-slate-500 w-28 flex-shrink-0">{priceLevelLabel(level)}</div>
              <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-brand-500/60 rounded transition-all duration-700"
                  style={{ width: `${(priceDist[level] / maxPrice) * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 w-6 text-right">{priceDist[level]}</div>
            </div>
          ))}
        </div>
        {nearby.avg_price_level !== null && (
          <div className="mt-3 text-xs text-slate-500">
            Market average: <span className="text-slate-900 font-medium">{priceLevelLabel(Math.round(nearby.avg_price_level))}</span>
          </div>
        )}
      </div>

      {/* Rating distribution */}
      <div className="ui-card p-5">
        <div className="font-display font-semibold text-slate-900 text-sm mb-1">Competitor rating breakdown</div>
        <p className="text-xs text-slate-500 mb-4">Higher bands usually indicate stronger local incumbents. Lower bands usually indicate room for a more trusted operator.</p>
        <div className="space-y-2.5">
          {ratingBands.map((b, i) => (
            <div key={b.label} className="flex items-center gap-3">
              <div className="text-xs w-24 flex-shrink-0" style={{ color: b.color }}>{b.label}</div>
              <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{ width: `${(ratingCounts[i] / maxRating) * 100}%`, background: b.color, opacity: 0.7 }}
                />
              </div>
              <div className="text-xs text-slate-500 w-6 text-right">{ratingCounts[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review velocity signals */}
      <div className="ui-card p-5">
        <div className="font-display font-semibold text-slate-900 text-sm mb-3">Review velocity signals</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-display font-bold text-amber-600">{highReview.length}</div>
            <div className="text-xs text-slate-500">competitors with 200+ reviews</div>
            <div className="text-xs text-slate-400 mt-1">
              {highReview.length === 0 ? 'SEO review gap — first-mover advantage available' :
               highReview.length <= 2 ? 'Limited entrenched competition' : 'Competitive review landscape'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-emerald-600">{noReview.length}</div>
            <div className="text-xs text-slate-500">with zero or no reviews</div>
            <div className="text-xs text-slate-400 mt-1">
              {noReview.length > 2 ? 'Many ghost competitors — low real competition despite count' : 'Market has established review presence'}
            </div>
          </div>
        </div>
      </div>

      {/* Open/closed now */}
      {(openCount + closedCount) > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-slate-900 text-sm mb-3">Current trading status</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-emerald-600">Open now ({openCount})</span>
                <span className="text-zinc-500">Closed ({closedCount})</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-brand-500/70 rounded-l-full transition-all duration-700"
                  style={{ width: `${(openCount / (openCount + closedCount)) * 100}%` }}
                />
                <div
                  className="h-full bg-zinc-300 rounded-r-full"
                  style={{ width: `${(closedCount / (openCount + closedCount)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          {closedCount > openCount && (
            <p className="text-xs text-amber-700 mt-2">
              Majority of competitors are currently closed — opening during these hours gives you uncontested access to demand.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
