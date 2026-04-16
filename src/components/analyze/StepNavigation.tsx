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
  return (
    <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-6">
        {labels.slice(0, totalSteps).map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors
                ${i < step  ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === step ? 'border-emerald-500 bg-white text-emerald-600 shadow-sm' :
                               'border-slate-300 bg-white text-slate-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-slate-900' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function StepNavigation({ step, totalSteps, labels, loading, disabled = false, onBack, onNext, onSubmit }: Props) {
  const isLast = step === totalSteps - 1

  return (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {step > 0 ? 'Back' : 'Home'}
        </button>

        <span className="text-xs text-slate-400">{labels[step] ?? `Step ${step + 1}`} · {step + 1} of {totalSteps}</span>

        {isLast ? (
          <button
            onClick={onSubmit}
            disabled={loading || disabled}
            className="ui-primary-btn disabled:cursor-not-allowed disabled:border-emerald-200 disabled:bg-emerald-100 disabled:text-emerald-500 disabled:shadow-none"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analysing...</>
              : <>Generate report <ChevronRight size={16} /></>}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={disabled}
            className="ui-primary-btn disabled:cursor-not-allowed disabled:border-emerald-200 disabled:bg-emerald-100 disabled:text-emerald-500 disabled:shadow-none"
          >
            Continue <ArrowRight size={16} />
          </button>
        )}
        </div>
      </div>
    </div>
  )
}
