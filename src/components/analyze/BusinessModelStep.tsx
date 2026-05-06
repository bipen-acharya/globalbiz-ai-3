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
      {OPTIONS.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-150"
            style={{
              border: selected ? '2px solid #16A34A' : '1px solid #E2E8F0',
              background: selected ? '#F0FDF4' : '#FFFFFF',
              boxShadow: selected ? '0 0 0 4px rgba(22,163,74,0.06)' : 'none',
            }}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-0.5" style={{ color: selected ? '#15803D' : '#0F172A' }}>
                {opt.title}
              </div>
              <div className="text-xs leading-relaxed text-slate-500">{opt.desc}</div>
            </div>
            <div
              className="ml-auto mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                borderColor: selected ? '#16A34A' : '#E2E8F0',
                background: selected ? '#16A34A' : 'transparent',
              }}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
