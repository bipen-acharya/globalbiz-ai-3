'use client'

import type { BusinessModelType } from '@/types'

interface Props {
  value: BusinessModelType | ''
  onChange: (v: BusinessModelType) => void
}

const OPTIONS: { value: BusinessModelType; icon: string; title: string; desc: string }[] = [
  {
    value: 'physical',
    icon: '🏪',
    title: 'Physical business',
    desc: 'A shopfront, café, salon, gym, or any business with a physical location customers visit.',
  },
  {
    value: 'online',
    icon: '💻',
    title: 'Online business',
    desc: 'An e-commerce store, SaaS product, digital service, or any business operating entirely online.',
  },
  {
    value: 'hybrid',
    icon: '🔄',
    title: 'Hybrid business',
    desc: 'A physical location plus an online presence — delivery, e-commerce, or digital services.',
  },
]

export function BusinessModelStep({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all
            ${value === opt.value
              ? 'border-brand-500 bg-emerald-50'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
          <div>
            <div className={`font-display font-semibold text-sm mb-0.5 ${value === opt.value ? 'text-brand-600' : 'text-slate-900'}`}>
              {opt.title}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">{opt.desc}</div>
          </div>
          <div className={`ml-auto mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors
            ${value === opt.value ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`} />
        </button>
      ))}
    </div>
  )
}
