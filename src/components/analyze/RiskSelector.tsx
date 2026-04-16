'use client'

interface Props {
  value: string
  onChange: (v: 'low' | 'medium' | 'high') => void
}

export function RiskSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(['low', 'medium', 'high'] as const).map(r => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all
            ${value === r
              ? 'border-brand-500 bg-emerald-50 text-brand-600'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
