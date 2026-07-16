// ─────────────────────────────────────────────────────────────────────────────
// /market-intelligence — Australian industry data by state.
// Static curated dataset (ABS-derived), revalidated daily via ISR.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  STATE_PROFILES,
  SURVIVAL_RATES,
  RISK_REWARD,
  GROWING_INDUSTRIES,
  DECLINING_INDUSTRIES,
  DATA_SOURCE_NOTE,
} from '@/data/market-intelligence'

export const revalidate = 86400 // daily

export const metadata: Metadata = {
  title: 'Australian Market Intelligence — GlobalBiz AI',
  description:
    'Which businesses thrive in each Australian state, industry survival rates, high-risk high-reward plays, and growing vs declining categories. ABS-derived data.',
}

function OutlookBadge({ outlook }: { outlook: 'strong' | 'stable' | 'challenged' }) {
  const styles = {
    strong: { background: 'rgba(5,150,105,0.08)', color: 'var(--ok)', border: '1px solid rgba(5,150,105,0.25)' },
    stable: { background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.2)' },
    challenged: { background: 'rgba(217,119,6,0.08)', color: 'var(--warn)', border: '1px solid rgba(217,119,6,0.25)' },
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={styles[outlook]}>
      {outlook}
    </span>
  )
}

function RiskBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const styles = {
    High: { background: 'rgba(220,38,38,0.08)', color: 'var(--danger)' },
    Medium: { background: 'rgba(217,119,6,0.08)', color: 'var(--warn)' },
    Low: { background: 'rgba(5,150,105,0.08)', color: 'var(--ok)' },
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={styles[level]}>
      {level}
    </span>
  )
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--paper)' }}>{title}</h2>
      {sub && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{sub}</p>}
    </div>
  )
}

export default function MarketIntelligencePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-1)', color: 'var(--paper)' }}>
      {/* Nav */}
      <nav className="nav-blur sticky top-0 z-40 flex items-center justify-between px-6 py-3.5">
        <Link href="/" className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
          GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/news" className="btn btn-ghost text-sm">News</Link>
          <Link href="/analyze" className="btn btn-gold text-sm">Generate report</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10 space-y-16">
        {/* Header */}
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
            ABS-derived data · Reviewed quarterly
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: 'var(--paper)' }}>
            Australian market intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
            Which industries thrive in each state, how long businesses actually survive,
            and where the risk sits — so you can pick your battles before you commit capital.
          </p>
        </header>

        {/* State profiles */}
        <section aria-labelledby="states-heading">
          <SectionHeading
            eyebrow="By state"
            title="What works where"
            sub="Dominant and fastest-growing industries in every state and territory."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {STATE_PROFILES.map(s => (
              <div key={s.abbrev} className="rounded-2xl p-5"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>{s.state}</h3>
                  <span className="rounded-md px-2 py-0.5 text-xs font-bold"
                    style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>{s.abbrev}</span>
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {s.topIndustries.map(ind => (
                    <span key={ind} className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{ background: 'var(--ink-3)', color: 'var(--paper-2)' }}>{ind}</span>
                  ))}
                </div>
                <div className="mb-2 text-xs" style={{ color: 'var(--paper-4)' }}>
                  Fastest growing: <span className="font-semibold" style={{ color: 'var(--ok)' }}>{s.fastestGrowing}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Survival rates */}
        <section aria-labelledby="survival-heading">
          <SectionHeading
            eyebrow="Survival rates"
            title="How long businesses actually last"
            sub="Share of new businesses still operating after 1 and 4 years, by industry."
          />
          <div className="overflow-x-auto rounded-2xl"
            style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <table className="w-full text-sm" style={{ minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line-2)' }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--paper-4)' }}>Industry</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--paper-4)' }}>1-year</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--paper-4)' }}>4-year</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--paper-4)' }}>Outlook</th>
                </tr>
              </thead>
              <tbody>
                {SURVIVAL_RATES.map((r, i) => (
                  <tr key={r.industry} style={{ borderBottom: i < SURVIVAL_RATES.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--paper)' }}>{r.industry}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--paper-2)' }}>{r.year1}%</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'var(--ink-3)' }}>
                          <div className="h-full rounded-full" style={{ width: `${r.year4}%`, background: r.year4 >= 60 ? 'var(--ok)' : r.year4 >= 50 ? 'var(--warn)' : 'var(--danger)' }} />
                        </div>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--paper)' }}>{r.year4}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right"><OutlookBadge outlook={r.outlook} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Risk / reward */}
        <section aria-labelledby="risk-heading">
          <SectionHeading
            eyebrow="Risk profile"
            title="High risk, high reward — and the quiet safe bets"
            sub="Where failure rates and upside actually sit, category by category."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RISK_REWARD.map(r => (
              <div key={r.industry} className="rounded-2xl p-5"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="mb-2 text-[0.95rem] font-semibold leading-snug" style={{ color: 'var(--paper)' }}>{r.industry}</h3>
                <div className="mb-3 flex items-center gap-3 text-xs" style={{ color: 'var(--paper-4)' }}>
                  <span className="flex items-center gap-1.5">Risk <RiskBadge level={r.risk} /></span>
                  <span className="flex items-center gap-1.5">Reward <RiskBadge level={r.rewardPotential} /></span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{r.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Growing vs declining */}
        <section aria-labelledby="trends-heading">
          <SectionHeading
            eyebrow="Structural trends"
            title="Growing vs declining categories"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--ok)' }}>Growing now</h3>
              <ul className="space-y-2">
                {GROWING_INDUSTRIES.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--paper-2)' }}>
                    <span className="mt-0.5" style={{ color: 'var(--ok)' }}>↗</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--danger)' }}>Structurally declining</h3>
              <ul className="space-y-2">
                {DECLINING_INDUSTRIES.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--paper-2)' }}>
                    <span className="mt-0.5" style={{ color: 'var(--danger)' }}>↘</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA + source note */}
        <section className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--paper)' }}>
            Ready to test a specific idea in a specific suburb?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--paper-3)' }}>
            This page shows the national picture. A full report checks your exact suburb
            against live Google Maps competitor data.
          </p>
          <Link href="/analyze" className="btn btn-gold mt-5 inline-flex">Generate a report</Link>
        </section>

        <p className="pb-4 text-center text-xs leading-relaxed" style={{ color: 'var(--paper-4)' }}>
          {DATA_SOURCE_NOTE}
        </p>
      </main>
    </div>
  )
}
