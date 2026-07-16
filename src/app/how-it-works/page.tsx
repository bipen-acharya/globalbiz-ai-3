// ─────────────────────────────────────────────────────────────────────────────
// /how-it-works — transparent explanation of the data pipeline.
// Static content page. Honest founder-to-founder tone, no marketing language.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Database, Cpu, FileText, PenLine } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works — GlobalBiz AI',
  description:
    'Exactly where GlobalBiz AI gets its data, how the scores are calculated, what the AI does and does not do, and how fresh each data source is.',
}

const PIPELINE_STEPS = [
  {
    icon: PenLine,
    title: 'Your inputs',
    body: 'Business type, suburb, price range, goals — everything you type in the form becomes context for the analysis.',
  },
  {
    icon: Database,
    title: 'Live data fetch',
    body: 'We call the Google Maps Places API in real time and pull every similar business within your chosen radius — names, ratings, review counts, price levels.',
  },
  {
    icon: Cpu,
    title: 'AI analysis',
    body: 'The AI reads the competitor landscape alongside your inputs and Australian business context, then synthesises findings. Scores come from our own formula engine — the AI cannot override them.',
  },
  {
    icon: FileText,
    title: 'Scored report',
    body: 'You get a structured report with every section labelled by its data source — real data, rules-based, or estimated.',
  },
]

const DATA_SOURCES = [
  {
    name: 'Google Maps Places API',
    freshness: 'Live at report time',
    what: 'Real business names, star ratings, review counts, price levels, and locations for every similar business in your radius. This is real data — not estimated.',
  },
  {
    name: 'Your form inputs',
    freshness: 'What you provide',
    what: 'Business type, suburb, budget, pricing, goals. The report quality tracks the honesty and detail of what you enter.',
  },
  {
    name: 'ABS industry data',
    freshness: 'Refreshed quarterly',
    what: 'Business survival rates, industry counts by state, and growth trends from the Australian Bureau of Statistics. Powers the Market Intelligence page and scoring context.',
  },
  {
    name: 'Australian news feeds',
    freshness: 'Updated hourly',
    what: 'RSS feeds from SmartCompany, Startup Daily, ABC Business, Inside Retail, and Hospitality Magazine — powering the News page.',
  },
  {
    name: 'AI synthesis',
    freshness: 'Generated per report',
    what: 'The recommendations, roadmaps, and written analysis. These are interpretations built on the data above — directional guidance, not facts.',
  },
]

const BADGES = [
  {
    label: 'Real data',
    color: 'var(--ok)',
    bg: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.25)',
    meaning: 'Pulled directly from Google Maps at the moment your report ran. Competitor counts, ratings, and locations are facts, not estimates.',
  },
  {
    label: 'Rules based',
    color: 'var(--gold)',
    bg: 'var(--gold-soft)',
    border: 'rgba(79,70,229,0.25)',
    meaning: 'Derived from documented Australian business rules — licensing requirements, council permit patterns, ABS survival data.',
  },
  {
    label: 'Estimated insight',
    color: 'var(--warn)',
    bg: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.25)',
    meaning: 'AI synthesis based on patterns. Treat as a directional starting point for your own research, not a verdict.',
  },
]

const FRESHNESS = [
  { source: 'Competitor data', cadence: 'Live — fetched at the exact moment you run a report' },
  { source: 'Business news', cadence: 'Every hour' },
  { source: 'Events', cadence: 'Reviewed monthly' },
  { source: 'Market intelligence', cadence: 'Page refreshes daily; underlying ABS data reviewed quarterly' },
]

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
      {children}
    </div>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--paper)' }}>{title}</h2>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-1)', color: 'var(--paper)' }}>
      {/* Nav */}
      <nav className="nav-blur sticky top-0 z-40 flex items-center justify-between px-6 py-3.5">
        <Link href="/" className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
          GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
        </Link>
        <Link href="/analyze" className="btn btn-gold text-sm">Generate report</Link>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-16">
        {/* Header */}
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
            Full transparency
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: 'var(--paper)' }}>
            How GlobalBiz AI actually works
          </h1>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
            Before you act on any report, you deserve to know exactly where the data comes from,
            what&apos;s real versus estimated, and what the AI can and can&apos;t do. Here&apos;s the honest version.
          </p>
        </header>

        {/* Pipeline */}
        <section>
          <SectionHeading eyebrow="The pipeline" title="From your inputs to a scored report" />
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4 rounded-2xl p-5"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
                  <step.icon size={18} />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--paper-4)' }}>{i + 1}</span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--paper)' }}>{step.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <SectionHeading eyebrow="Data sources" title="Where every number comes from" />
          <div className="space-y-3">
            {DATA_SOURCES.map(s => (
              <Card key={s.name}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--paper)' }}>{s.name}</h3>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: 'var(--ink-3)', color: 'var(--paper-2)' }}>{s.freshness}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{s.what}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Scoring */}
        <section>
          <SectionHeading eyebrow="Scoring" title="How the scores are calculated" />
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-2)' }}>
              Scores come from a formula engine, not the AI. The viability score combines competitor
              density in your radius, the average rating of those competitors (strong incumbents are
              harder to displace than weak ones), your price point relative to the local market, and
              suburb-level demand signals. The AI writes the analysis <em>around</em> these scores — it
              is never allowed to change them. That separation matters: it means two people running
              the same business in the same suburb get the same scores, every time.
            </p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--paper-2)' }}>
              A higher viability score means fewer strong competitors and more room in the market.
              A high failure-risk score doesn&apos;t mean &quot;don&apos;t do it&quot; — it means the category demands
              exceptional execution, and the report will tell you where.
            </p>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <SectionHeading eyebrow="Source labels" title="What the badges on your report mean" />
          <div className="space-y-3">
            {BADGES.map(b => (
              <Card key={b.label}>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                  {b.label}
                </span>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>{b.meaning}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* AI does / doesn't */}
        <section>
          <SectionHeading eyebrow="Honest limits" title="What the AI does — and doesn't do" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--ok)' }}>It does</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--paper-2)' }}>
                <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>✓</span>Read real competitor data and find patterns</li>
                <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>✓</span>Synthesise 50+ signals into structured recommendations</li>
                <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>✓</span>Apply Australian business context — permits, councils, seasons</li>
                <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>✓</span>Surface risks you might not have considered</li>
              </ul>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--danger)' }}>It doesn&apos;t</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--paper-2)' }}>
                <li className="flex gap-2"><span style={{ color: 'var(--danger)' }}>✕</span>Predict the future or guarantee success</li>
                <li className="flex gap-2"><span style={{ color: 'var(--danger)' }}>✕</span>Access private financials or foot-traffic counters</li>
                <li className="flex gap-2"><span style={{ color: 'var(--danger)' }}>✕</span>Replace legal, accounting, or financial advice</li>
                <li className="flex gap-2"><span style={{ color: 'var(--danger)' }}>✕</span>Know things that happened in the last few weeks</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Freshness */}
        <section>
          <SectionHeading eyebrow="Freshness" title="How current each source is" />
          <div className="overflow-hidden rounded-2xl"
            style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {FRESHNESS.map((f, i) => (
              <div key={f.source} className="flex items-center justify-between gap-4 px-5 py-3.5"
                style={{ borderBottom: i < FRESHNESS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--paper)' }}>{f.source}</span>
                <span className="text-right text-sm" style={{ color: 'var(--paper-3)' }}>{f.cadence}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section>
          <SectionHeading eyebrow="Privacy" title="What happens to your data" />
          <Card>
            <ul className="space-y-2.5 text-sm leading-relaxed" style={{ color: 'var(--paper-2)' }}>
              <li>Reports live in your browser session only — closing the tab deletes the report.</li>
              <li>We don&apos;t store your business details in a database.</li>
              <li>We never sell or share your information with third parties.</li>
              <li>Form inputs are sent to our AI provider solely to generate your report, under commercial terms that exclude training on your data.</li>
            </ul>
          </Card>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--paper)' }}>
            See it on your own idea
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--paper-3)' }}>
            The fastest way to judge the report quality is to run one on a business you know well.
          </p>
          <Link href="/analyze" className="btn btn-gold mt-5 inline-flex">
            Generate a report <ArrowRight size={15} />
          </Link>
        </section>
      </main>
    </div>
  )
}
