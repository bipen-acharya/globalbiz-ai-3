'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, MapPin, Search, ShieldCheck, TrendingUp, Wifi } from 'lucide-react'

export default function LandingPage() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/daily-count')
      .then(response => response.json())
      .then(data => setRemaining(data.remaining))
      .catch(() => setRemaining(10))
  }, [])

  const featureCards = [
    {
      icon: Building2,
      title: 'Founder validation and growth',
      description: 'Use the same workflow to test a new concept, diagnose an underperforming business, or choose the best expansion path.',
    },
    {
      icon: MapPin,
      title: 'Suburb-level Australian intelligence',
      description: 'Search real suburbs, councils, and postcodes, then compare local competition, opportunity, and nearby alternatives.',
    },
    {
      icon: Wifi,
      title: 'Physical, online, and hybrid logic',
      description: 'Switch the analysis by operating model so location, delivery, and digital assumptions stay commercially realistic.',
    },
    {
      icon: ShieldCheck,
      title: 'Australian setup guidance',
      description: 'Every report includes a business-aware setup and permits checklist so founders can plan with fewer blind spots.',
    },
  ]

  const previewScores = [
    ['Business viability', '81'],
    ['Decision confidence', '76'],
    ['Suburb opportunity', '74'],
    ['Expansion readiness', '68'],
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900">
          GlobalBiz <span className="text-emerald-500">AI</span>
        </span>
        <div className="flex items-center gap-4">
          {remaining !== null && remaining > 0 && (
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 sm:inline">
              {remaining} free {remaining === 1 ? 'report' : 'reports'} left today
            </span>
          )}
          <Link href="/analyze" className="ui-primary-btn">
            Start free
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.14),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Australia-only founder intelligence
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr]">
            <div>
              <h1 className="mb-6 max-w-3xl text-5xl font-display font-bold leading-[1.02] text-slate-900 sm:text-6xl">
                Find out if the business works before the spend.
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-600">
                Validate a new idea, understand why a current business is underperforming, and decide whether suburb, pricing, delivery, or digital growth is the smarter next move.
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {remaining === 0 ? (
                  <Link href="/waitlist" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-amber-600">
                    Join today&apos;s waitlist <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
                    Generate founder report <ArrowRight size={18} />
                  </Link>
                )}
                <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50">
                  <Search size={18} />
                  Find businesses in my area
                </Link>
                <span className="w-full text-sm text-slate-500 sm:w-auto">No account needed • suburb and digital growth analysis</span>
              </div>
              <p className="text-sm text-slate-500">
                Already have a business?{' '}
                <Link href="/existing" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Get a turnaround report →
                </Link>
              </p>

              <div className="flex flex-wrap gap-2">
                {['Start new or grow existing', 'Suburb-level analysis', 'Physical / online / hybrid', 'Setup + expansion guidance'].map(item => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="ui-section p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Report preview</div>
                  <div className="mt-1 font-display text-2xl font-semibold text-slate-900">Adelaide hybrid grocery concept</div>
                  <div className="mt-2 text-sm text-slate-600">Founder-ready summary with viability, local competition, permits, and expansion pathways.</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
                  <div className="text-3xl font-display font-bold text-emerald-700">78</div>
                  <div className="text-xs text-emerald-700">Decision score</div>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                {previewScores.map(([label, value]) => (
                  <div key={label} className="ui-info-box">
                    <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
                    <div className="text-lg font-semibold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-600">What the founder sees</div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Local incumbents are established but not unbeatable. The strongest path is a convenience-led range, sharper delivery positioning, and tighter supplier economics before locking in fit-out spend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            ['Australia only', 'Built for local decisions'],
            ['Suburb search', 'Council and postcode aware'],
            ['Two founder modes', 'Validate or improve'],
            ['Real + estimated', 'Clearly labelled insights'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="mb-1 text-2xl font-display font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-emerald-600">What&apos;s inside</p>
          <h2 className="text-3xl font-display font-bold text-slate-900">A premium validation workflow for Australian founders</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(card => (
            <div key={card.title} className="ui-card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <card.icon size={20} />
              </div>
              <div className="mb-2 font-display text-lg font-semibold text-slate-900">{card.title}</div>
              <p className="text-sm leading-relaxed text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="ui-card p-7">
            <div className="mb-3 text-sm font-semibold text-emerald-600">Start a new business</div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Check suburb fit, competitor density, pricing confidence, launch timing, and break-even realism.</li>
              <li>Reduce typing with structured audiences, price bands, delivery coverage, and realistic market inputs.</li>
              <li>Get Australian setup and permits guidance before spending on lease, stock, or fit-out.</li>
            </ul>
          </div>
          <div className="ui-card p-7">
            <div className="mb-3 text-sm font-semibold text-emerald-600">Grow an existing business</div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Diagnose underperformance across pricing, visibility, retention, delivery, and operational bottlenecks.</li>
              <li>See whether suburb expansion, digital acquisition, better margins, or stronger repeat revenue is the smarter move.</li>
              <li>Use an investor-style report structure built around confidence, bottlenecks, fastest levers, and action plans.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-500 shadow-sm">
            <TrendingUp size={14} className="text-emerald-500" />
            Investor-ready business intelligence for Australian founders
          </div>
          <h2 className="mb-6 text-4xl font-display font-bold text-slate-900">Make the business call with more confidence.</h2>
          <p className="mb-8 text-lg leading-relaxed text-slate-600">
            Run a suburb-level startup check or a growth diagnosis for an existing business, then move with clearer evidence and fewer avoidable mistakes.
          </p>
          <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
            Start your Australian report <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
