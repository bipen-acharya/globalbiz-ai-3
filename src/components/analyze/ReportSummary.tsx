'use client'

import type { BusinessFormData } from '@/types'

interface Props { form: BusinessFormData }

const MODEL_LABELS: Record<string, string> = {
  physical: '🏪 Physical',
  online:   '💻 Online',
  hybrid:   '🔄 Hybrid',
}

const GOAL_LABELS: Record<string, string> = {
  start_new: 'Start new',
  grow_existing: 'Grow existing',
}

export function ReportSummary({ form }: Props) {
  const isPureOnline = form.business_model_type === 'online'
  const location = isPureOnline
    ? (form.target_market || 'Australian market')
    : ([form.suburb, form.city, form.state].filter(Boolean).join(', ') || form.state || '—')

  const rows: [string, string][] = [
    ['Business', form.business_name || (form.business_type === 'Other' ? form.business_type_other || 'Other' : form.business_type || '—')],
    ['Concept', form.business_concept || '—'],
    ['Goal', GOAL_LABELS[form.user_goal_mode] ?? form.user_goal_mode],
    ['Model', MODEL_LABELS[form.business_model_type] ?? form.business_model_type],
    ['Location', location],
    ['Hours', form.operating_hours || 'Not set'],
    ['Audience', form.target_customers.length ? form.target_customers.join(', ') : '—'],
    ['Community', form.community_type || '—'],
    ['Focus', form.user_goal_mode === 'start_new' ? form.launch_timeline || '—' : form.growth_strategy_type || form.expansion_goal || '—'],
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Your report will cover</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <div className="text-slate-400">{label}</div>
            <div className="truncate text-right font-medium text-slate-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
