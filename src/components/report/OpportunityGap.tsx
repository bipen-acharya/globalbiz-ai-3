'use client'

import type { AnalysisResult } from '@/types'
import { scoreColor, scoreBarColor } from '@/lib/utils'

interface Props {
  analysis: AnalysisResult
}

function GapBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-xs font-medium ${scoreColor(score)}`}>{score}/100</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(score)}`}
          style={{ width: `${score}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}

export function OpportunityGap({ analysis }: Props) {
  return (
    <div className="space-y-5">
      {/* Opportunity scores */}
      <div className="ui-card p-5">
        <div className="font-display font-semibold text-slate-900 text-sm mb-4">Opportunity analysis</div>
        <div className="space-y-4">
          <GapBar label="Opportunity gap score"    score={analysis.opportunity_gap_score}    delay={0}   />
          <GapBar label="Demand probability"       score={analysis.demand_probability_score} delay={100} />
          <GapBar label="Pricing fit"              score={analysis.pricing_fit_score}        delay={200} />
        </div>
      </div>

      {/* Best underserved niche */}
      {analysis.best_underserved_niche && (
        <div className="ui-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 text-sm">★</span>
            </div>
            <div>
              <div className="font-display font-semibold text-slate-900 text-sm mb-1">Best underserved niche</div>
              <p className="text-sm text-slate-600 leading-relaxed">{analysis.best_underserved_niche}</p>
            </div>
          </div>
        </div>
      )}

      {/* Suggested better suburb */}
      {analysis.suggested_better_suburb && (
        <div className="ui-card-selected p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 text-sm">📍</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-display font-semibold text-slate-900 text-sm">Suggested better location</div>
                <span className={`text-base font-display font-bold ${scoreColor(analysis.suggested_better_suburb.score)}`}>
                  {analysis.suggested_better_suburb.score}/100
                </span>
              </div>
              <div className="text-sm text-emerald-700 font-medium mb-1">{analysis.suggested_better_suburb.name}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{analysis.suggested_better_suburb.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Differentiation tactics */}
      {analysis.best_differentiation?.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-slate-900 text-sm mb-3">How to differentiate</div>
          <div className="space-y-2">
            {analysis.best_differentiation.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity highlights */}
      {analysis.opportunity_highlights?.length > 0 && (
        <div className="ui-card p-5">
          <div className="font-display font-semibold text-slate-900 text-sm mb-3">Market opportunities</div>
          <div className="space-y-2">
            {analysis.opportunity_highlights.map((o, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="text-amber-600 mt-0.5 flex-shrink-0">✦</span>
                {o}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
