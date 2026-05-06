'use client'

interface Props {
  value: string
  onChange: (v: 'low' | 'medium' | 'high') => void
}

const RISK_CONFIG = {
  low: { color: '#16A34A', bg: '#F0FDF4', border: '#16A34A', text: '#15803D' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
  high: { color: '#DC2626', bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
} as const

export function RiskSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(['low', 'medium', 'high'] as const).map(r => {
        const selected = value === r
        const cfg = RISK_CONFIG[r]
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className="py-3 rounded-xl text-sm font-medium capitalize transition-all duration-150"
            style={{
              border: selected ? `2px solid ${cfg.border}` : '1px solid #E2E8F0',
              background: selected ? cfg.bg : '#FFFFFF',
              color: selected ? cfg.text : '#64748B',
            }}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
