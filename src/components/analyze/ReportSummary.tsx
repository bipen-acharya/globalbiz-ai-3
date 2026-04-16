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
  const location = [form.suburb, form.city, form.state].filter(Boolean).join(', ') || form.state || '—'
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
    <div className="ui-card p-4">
      <div className="text-xs text-slate-500 uppercase tracking-[0.18em] mb-3">Your report will cover</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {rows.map(([label, value]) => (
          // key on a real element, not a fragment — fragments cannot have keys in React 18 JSX
          <div key={label} className="contents">
            <div className="text-slate-500">{label}</div>
            <div className="text-slate-900 text-right truncate">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
