'use client'

import { ArrowLeft, ArrowRight, Loader2, ChevronRight } from 'lucide-react'

interface Props {
  step: number
  totalSteps: number
  labels: string[]
  loading: boolean
  disabled?: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export function StepProgress({ step, totalSteps, labels }: { step: number; totalSteps: number; labels: string[] }) {
  const pct = ((step + 1) / totalSteps) * 100

  return (
    <div className="px-6 pt-5 pb-2 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto">
        {labels.slice(0, totalSteps).map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={
                  i < step
                    ? { background: '#16A34A', color: '#FFFFFF' }
                    : i === step
                    ? { background: '#F0FDF4', border: '2px solid #16A34A', color: '#16A34A' }
                    : { background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8' }
                }
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:block truncate max-w-[64px]"
                style={{ color: i === step ? '#0F172A' : '#94A3B8' }}
              >
                {label}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className="flex-1 h-px transition-all"
                style={{ background: i < step ? '#16A34A' : '#E2E8F0' }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
        <div className="h-full rounded-full progress-glow" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function StepNavigation({ step, totalSteps, labels, loading, disabled = false, onBack, onNext, onSubmit }: Props) {
  const isLast = step === totalSteps - 1

  return (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition-all hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {step > 0 ? 'Back' : 'Home'}
        </button>

        <span className="text-xs text-slate-400">
          {labels[step] ?? `Step ${step + 1}`} · {step + 1} of {totalSteps}
        </span>

        {isLast ? (
          <button onClick={onSubmit} disabled={loading || disabled} className="ui-primary-btn">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analysing...</>
              : <>Generate report <ChevronRight size={16} /></>}
          </button>
        ) : (
          <button onClick={onNext} disabled={disabled} className="ui-primary-btn">
            Continue <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
