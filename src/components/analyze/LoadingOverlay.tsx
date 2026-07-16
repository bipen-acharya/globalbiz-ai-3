'use client'

import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Scanning competitors',      sub: 'Pulling real Google Maps data and competitor signals.' },
  { label: 'Analysing demand',          sub: 'Measuring market demand, audience fit, and market gaps.' },
  { label: 'Generating insights',       sub: 'Scoring viability, differentiation, and expansion readiness.' },
  { label: 'Building your action plan', sub: 'Adding Australian setup, permits, and 90-day guidance.' },
]

export default function LoadingOverlay() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, STAGES.length - 1)), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-md text-center px-6">
        <div className="eyebrow no-rule justify-center" style={{ color: 'var(--gold)' }}>Generating report</div>

        <h2 className="display mt-6" style={{ fontSize: 'var(--t-h2)' }}>
          {STAGES[idx].label}<span className="anim-blink" style={{ color: 'var(--gold)' }}>.</span>
        </h2>
        <p className="mt-4 text-sm" style={{ color: 'var(--paper-3)' }}>{STAGES[idx].sub}</p>

        <div className="mt-10 w-full">
          <div className="score-track">
            <div className="h-full" style={{
              width: `${((idx + 1) / STAGES.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-2) 100%)',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--paper-4)' }}>
            <span>Step {idx + 1} of {STAGES.length}</span>
            <span>Usually 10–20 seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}
