'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight, MapPin, BarChart3, TrendingUp,
  ChevronRight, FileText, Sparkles,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'

// ─────────────────────────────────────────────────────────────────────────────
// LANDING — editorial dark luxury, serif-led, single accent.
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '8,400+', label: 'Suburbs analysed' },
  { value: 'AUD',    label: 'Calibrated currency' },
  { value: 'Real',   label: 'Competitor data' },
  { value: '3 min',  label: 'To a full report' },
]

const TRUST_POINTS = [
  'Real Google Maps competitor data',
  'Suburb-precise scoring',
  'Australian-calibrated',
  'No account required',
  'Free during beta',
]

const CAPABILITIES = [
  { kicker: '01', title: 'Suburb-level demand scan',
    body: 'Real competitor density, ratings, and gaps for any Australian postcode — not city-wide averages.',
    icon: MapPin },
  { kicker: '02', title: 'Decision confidence score',
    body: 'A single number that tells you whether to commit, refine, or walk away from a concept.',
    icon: BarChart3 },
  { kicker: '03', title: 'Permit & compliance check',
    body: 'Council, licensing, and setup notes calibrated to Australian markets — not generic advice.',
    icon: FileText },
  { kicker: '04', title: 'Expansion pathways',
    body: 'When to open a second branch, when to go digital, when to raise prices — based on signal, not gut feel.',
    icon: TrendingUp },
]

const FLOWS = [
  { num: '01',
    title: 'Validate a new idea',
    body: 'Run a full feasibility report before you sign a lease, register an ABN, or quit your job.',
    href: '/analyze',
    cta: 'Start a new analysis' },
  { num: '02',
    title: 'Grow what you already have',
    body: 'Diagnose underperformance, pinpoint leaks, and surface the fastest growth lever.',
    href: '/grow-existing-business',
    cta: 'Diagnose existing business' },
  { num: '03',
    title: 'Explore the market',
    body: 'Discover ranked opportunities by category, keyword, or suburb — then validate the best one.',
    href: '/explore-business-ideas',
    cta: 'Explore ideas' },
]

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 },
    )
    document.querySelectorAll('.reveal').forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--ink-0)', color: 'var(--paper)' }}>
      {/* ── Nav ── */}
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative spotlight">
        <div className="container-wide pt-24 pb-28 lg:pt-32 lg:pb-36">

          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="eyebrow anim-fade-up">Australia · founder intelligence</div>

              <h1 className="display mt-8 anim-fade-up d-100" style={{ fontSize: 'var(--t-hero)' }}>
                Find out if the business works<br />
                <em>before</em> the spend.
              </h1>

              <p className="mt-8 max-w-xl anim-fade-up d-200" style={{ fontSize: 'var(--t-body)', color: 'var(--paper-2)' }}>
                Validate a new concept, diagnose why an existing business is underperforming, or surface the next move — pricing, suburb, delivery, or digital growth. Real competitor data. AI feasibility. Australian-calibrated.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-4 anim-fade-up d-300">
                <button onClick={() => router.push('/analyze')} className="btn btn-gold">
                  Generate founder report <ArrowUpRight size={16} />
                </button>
                <button onClick={() => router.push('/grow-existing-business')} className="btn btn-ghost">
                  Grow existing business
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm anim-fade-up d-400" style={{ color: 'var(--paper-3)' }}>
                <span className="inline-flex items-center gap-2"><Sparkles size={14} style={{ color: 'var(--gold)' }} />No account required</span>
                <span className="inline-flex items-center gap-2"><span className="h-1 w-1 rounded-full" style={{ background: 'var(--paper-3)' }} />Suburb-precise</span>
                <span className="inline-flex items-center gap-2"><span className="h-1 w-1 rounded-full" style={{ background: 'var(--paper-3)' }} />Physical · Online · Hybrid</span>
              </div>
            </div>

            {/* Report preview card */}
            <div className="lg:col-span-4 anim-fade-up d-500">
              <ReportPreview />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-24 grid grid-cols-2 gap-x-12 gap-y-8 border-t pt-10 sm:grid-cols-4 anim-fade-up d-600" style={{ borderColor: 'var(--line)' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div className="font-display text-3xl" style={{ color: 'var(--paper)' }}>{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: 'var(--paper-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section aria-label="Why founders trust GlobalBiz AI" className="border-y" style={{ background: 'var(--ink-1)', borderColor: 'var(--line)' }}>
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6">
          {TRUST_POINTS.map(point => (
            <span key={point} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--paper-2)' }}>
              <span className="text-base font-bold" style={{ color: 'var(--green)' }}>✓</span>
              {point}
            </span>
          ))}
        </div>
      </section>

      {/* ── Three flows ── */}
      <section id="flows" className="relative border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div className="reveal">
              <div className="eyebrow">Three ways in</div>
              <h2 className="display mt-6" style={{ fontSize: 'var(--t-h1)' }}>
                Built around the<br />
                <em>actual decisions</em><br />
                founders make.
              </h2>
              <p className="mt-6 max-w-md" style={{ color: 'var(--paper-3)' }}>
                Whether you&apos;re validating, diagnosing, or exploring — start from where you are and get to a concrete next move.
              </p>
            </div>

            <div className="flex flex-col">
              {FLOWS.map((f, i) => (
                <Link
                  key={f.num}
                  href={f.href}
                  className={`reveal group relative flex items-start gap-8 py-10 transition-colors hover:bg-ink-1 ${i !== 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'var(--line)', transitionDelay: `${i * 80}ms` }}
                >
                  <span className="mt-1 font-display text-2xl transition-colors" style={{ color: 'var(--paper-4)' }}>{f.num}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-2xl" style={{ color: 'var(--paper)' }}>{f.title}</h3>
                      <ArrowUpRight className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" size={20} style={{ color: 'var(--paper-3)' }} />
                    </div>
                    <p className="mt-3 max-w-xl" style={{ color: 'var(--paper-2)' }}>{f.body}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--paper-3)' }}>
                      {f.cta} <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="capabilities" className="border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-1)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="max-w-2xl reveal">
            <div className="eyebrow">Capabilities</div>
            <h2 className="display mt-6" style={{ fontSize: 'var(--t-h1)' }}>
              A founder report,<br />composed from <em>real signal</em>.
            </h2>
          </div>

          <div className="mt-16 grid gap-px sm:grid-cols-2" style={{ background: 'var(--line)' }}>
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.title}
                className="reveal group p-8 transition-colors"
                style={{ background: 'var(--ink-1)', transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <c.icon size={20} className="transition-transform group-hover:scale-110" style={{ color: 'var(--gold)' }} />
                  <span className="font-display text-sm" style={{ color: 'var(--paper-4)' }}>{c.kicker}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl" style={{ color: 'var(--paper)' }}>{c.title}</h3>
                <p className="mt-3" style={{ color: 'var(--paper-2)' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="grid gap-16 lg:grid-cols-3">
            {[
              { n: '01', t: 'Describe your concept', b: 'A few targeted questions — model, location, budget, customers. Under three minutes.' },
              { n: '02', t: 'We scan the market',     b: 'Real Google Maps competitor data, suburb demand signals, pricing, council requirements.' },
              { n: '03', t: 'Receive the report',    b: 'Scored, ranked, and ready to act on. Differentiation, threats, 90-day plan.' },
            ].map((s, i) => (
              <div key={s.n} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3" style={{ color: 'var(--paper-3)' }}>
                  <span className="font-display text-3xl" style={{ color: 'var(--gold)' }}>{s.n}</span>
                  <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
                </div>
                <h3 className="mt-6 font-display text-2xl" style={{ color: 'var(--paper)' }}>{s.t}</h3>
                <p className="mt-3" style={{ color: 'var(--paper-2)' }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="relative overflow-hidden rounded-lg border p-12 lg:p-20" style={{ borderColor: 'var(--line)', background: 'var(--ink-1)' }}>
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl" style={{ background: 'var(--gold)', opacity: 0.04 }} />
            <div className="relative max-w-2xl">
              <div className="eyebrow">Ready when you are</div>
              <h2 className="display mt-6" style={{ fontSize: 'var(--t-h1)' }}>
                The report is free.<br />
                The <em>clarity</em> is the value.
              </h2>
              <p className="mt-6" style={{ color: 'var(--paper-2)' }}>
                One concept. Three minutes. A full feasibility breakdown with real competitor data and a decision-grade score.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/analyze" className="btn btn-gold">
                  Begin a report <ArrowUpRight size={16} />
                </Link>
                <Link href="/explore" className="btn btn-ghost">
                  <MapPin size={16} /> Find in my area
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero floating preview card
// ─────────────────────────────────────────────────────────────────────────────
function ReportPreview() {
  const scores = [
    { label: 'Viability',         value: 81 },
    { label: 'Opportunity gap',   value: 74 },
    { label: 'Decision confidence', value: 76 },
    { label: 'Expansion ready',   value: 68 },
  ]

  return (
    <div className="surface-elevated relative overflow-hidden p-6 anim-drift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--paper-3)' }}>Report preview</div>
          <div className="mt-1 font-display text-xl" style={{ color: 'var(--paper)' }}>Adelaide · hybrid grocery</div>
        </div>
        <span className="tag tag-gold">Strong fit</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {scores.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 100 + 600}ms` }} className="anim-fade-up">
            <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--paper-3)' }}>{s.label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl" style={{ color: 'var(--paper)' }}>{s.value}</span>
              <span className="text-xs" style={{ color: 'var(--paper-4)' }}>/100</span>
            </div>
            <div className="score-track mt-2">
              <div className="score-fill" style={{ ['--target-width' as string]: `${s.value}%` } as React.CSSProperties} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rule" />
      <div className="mt-5 space-y-2 text-xs" style={{ color: 'var(--paper-3)' }}>
        <div className="flex items-center justify-between"><span>Competitors within 3 km</span><span style={{ color: 'var(--paper)' }}>12</span></div>
        <div className="flex items-center justify-between"><span>Avg local rating</span><span style={{ color: 'var(--paper)' }}>4.2 ★</span></div>
        <div className="flex items-center justify-between"><span>Break-even (est.)</span><span style={{ color: 'var(--paper)' }}>9 mo</span></div>
      </div>
    </div>
  )
}
