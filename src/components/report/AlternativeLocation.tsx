'use client'

import type { AlternativeLocation as AltLoc } from '@/types'
import { scoreColor, scoreBarColor, scoreLabel } from '@/lib/utils'

interface Props {
  locations: AltLoc[]
  currentSuburb: string
  currentScore: number
}

export function AlternativeLocations({ locations, currentSuburb, currentScore }: Props) {
  return (
    <div className="space-y-4">
      {/* Current location for comparison */}
      <div className="ui-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Your selected location</div>
            <div className="font-display font-semibold text-slate-900">{currentSuburb}</div>
          </div>
          <div className={`text-3xl font-display font-bold ${scoreColor(currentScore)}`}>{currentScore}</div>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${scoreBarColor(currentScore)}`} style={{ width: `${currentScore}%` }} />
        </div>
        <div className="text-xs text-slate-500 mt-1">{scoreLabel(currentScore)} feasibility</div>
      </div>

      <div className="text-xs text-slate-500 px-1">Nearby alternatives that may offer better conditions for your business:</div>

      {locations.map((loc, i) => {
        const delta = loc.score - currentScore
        return (
          <div key={i} className={`${i === 0 ? 'ui-card-selected' : 'ui-card'} p-5`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                {i === 0 && (
                  <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full mb-2 inline-block">
                    Best alternative
                  </span>
                )}
                <div className="font-display font-semibold text-slate-900">{loc.name}</div>
                {loc.suburb && loc.suburb !== currentSuburb && (
                  <div className="text-xs text-slate-500">{loc.suburb}{loc.postcode ? ` ${loc.postcode}` : ''}</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-display font-bold ${scoreColor(loc.score)}`}>{loc.score}</div>
                <div className={`text-xs font-medium ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-zinc-500' : 'text-slate-500'}`}>
                  {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'} vs current
                </div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(loc.score)}`}
                style={{ width: `${loc.score}%` }} />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{loc.reason}</p>
          </div>
        )
      })}
    </div>
  )
}
