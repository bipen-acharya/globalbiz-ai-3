'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, TrendingUp, MapPin, Wifi, BarChart3, Map, FileCheck, CheckCircle, Zap } from 'lucide-react'

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(n => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  const features = [
    { icon: MapPin, title: 'Suburb demand scan', desc: 'Search real suburbs, councils, and postcodes to compare local competition and opportunity.' },
    { icon: Map, title: 'Competitor mapping', desc: 'Real-time Google Maps competitor data with ratings, distance, and threat analysis.' },
    { icon: FileCheck, title: 'Permit checker', desc: 'Australian setup and permit checklist so you plan with fewer blind spots.' },
    { icon: BarChart3, title: 'Budget fit score', desc: 'Tests feasibility against your budget before you spend on lease or fit-out.' },
    { icon: TrendingUp, title: 'Expansion pathways', desc: 'Whether suburb expansion, digital, or better margins is the smarter move.' },
    { icon: Wifi, title: 'Digital vs physical', desc: 'Switch analysis by operating model — location, delivery, and digital assumptions stay realistic.' },
  ]

  const steps = [
    { step: '01', title: 'Describe your idea', body: 'Choose business type, operating model, and target suburb. Takes under 3 minutes.' },
    { step: '02', title: 'We scan your market', body: 'We pull competitor data, suburb demand, pricing signals, and permit requirements.' },
    { step: '03', title: 'Get your report', body: 'Receive a scored founder report with competitors, opportunity gaps, and a 90-day action plan.' },
  ]

  const previewScores = [
    ['Business viability', '81'],
    ['Market opportunity', '74'],
    ['Decision confidence', '76'],
    ['Expansion readiness', '68'],
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="font-display text-lg font-bold text-slate-900">
          GlobalBiz <span className="gradient-text">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/analyze" className="ui-primary-btn">
            Start free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white px-6 pb-20 pt-20">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(14,165,233,0.03) 0%, transparent 55%)' }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 fade-up-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Australia-only founder intelligence
              </div>

              <h1 className="mb-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl fade-up-2">
                Find out if the business works{' '}
                <span className="gradient-text">before the spend.</span>
              </h1>

              <div className="mb-6 fade-up-3">
                <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md">
                  Generate founder report <ArrowRight size={18} />
                </Link>
              </div>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600 fade-up-3">
                Validate a new idea, understand why a current business is underperforming, and decide whether suburb, pricing, delivery, or digital growth is the smarter next move.
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center fade-up-4">
                <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md">
                  Generate founder report <ArrowRight size={18} />
                </Link>
                <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900">
                  <Search size={18} />
                  Find businesses in my area
                </Link>
              </div>

              <p className="text-sm text-slate-400 fade-up-4">No account needed · suburb and digital growth analysis</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Start new or grow existing', 'Suburb-level analysis', 'Physical / online / hybrid', 'Setup + expansion guidance'].map(item => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div className="fade-up-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-widest text-slate-400">Report preview</div>
                    <div className="mt-1 font-display text-xl font-semibold text-slate-900">Adelaide hybrid grocery concept</div>
                    <div className="mt-1.5 text-sm text-slate-500">Founder-ready summary with viability, competition, permits, and expansion pathways.</div>
                  </div>
                  <div className="flex-shrink-0 rounded-xl bg-blue-50 px-4 py-3 text-right">
                    <div className="font-display text-3xl font-bold text-blue-600 score-card-reveal">78</div>
                    <div className="text-xs font-medium text-blue-600">Decision score</div>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  {previewScores.map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
                      <div className="font-display text-lg font-semibold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">Founder insight</div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Local incumbents are established but not unbeatable. The strongest path is a convenience-led range, sharper delivery positioning, and tighter supplier economics before locking in fit-out spend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y border-slate-200 bg-slate-50 px-6 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-8 text-center">
          {[
            ['2,400+', 'Reports Generated'],
            ['847', 'Suburbs Analysed'],
            ['94%', 'Founder Satisfaction'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="mb-1 font-display text-3xl font-bold text-blue-600">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">How it works</p>
            <h2 className="font-display text-3xl font-bold text-slate-900">Three steps to a founder-ready report</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item, i) => (
              <div key={item.step} className="reveal rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="mb-4 font-display text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {item.step}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 px-6 py-24" ref={featuresRef}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">What&apos;s inside</p>
            <h2 className="font-display text-3xl font-bold text-slate-900">Everything a founder needs to decide with confidence</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((card, i) => (
              <div
                key={card.title}
                className="reveal rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <card.icon size={20} />
                </div>
                <div className="mb-2 font-display text-base font-semibold text-slate-900">{card.title}</div>
                <p className="text-sm leading-relaxed text-slate-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="reveal rounded-xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <Zap size={13} /> Start a new business
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  'Check suburb fit, competitor density, pricing confidence, launch timing, and break-even realism.',
                  'Reduce typing with structured audiences, price bands, delivery coverage, and realistic market inputs.',
                  'Get Australian setup and permits guidance before spending on lease, stock, or fit-out.',
                ].map(text => (
                  <li key={text} className="flex items-start gap-2">
                    <CheckCircle size={15} className="mt-0.5 flex-shrink-0 text-blue-500" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal rounded-xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md" style={{ transitionDelay: '80ms' }}>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                <TrendingUp size={13} /> Grow an existing business
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  'Diagnose underperformance across pricing, visibility, retention, delivery, and operational bottlenecks.',
                  'See whether suburb expansion, digital acquisition, better margins, or stronger repeat revenue is smarter.',
                  'Use an investor-style report structure built around confidence, bottlenecks, fastest levers, and action plans.',
                ].map(text => (
                  <li key={text} className="flex items-start gap-2">
                    <CheckCircle size={15} className="mt-0.5 flex-shrink-0 text-sky-500" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-500">
            <TrendingUp size={13} className="text-blue-600" />
            Investor-ready business intelligence for Australian founders
          </div>
          <h2 className="mb-6 font-display text-4xl font-bold text-slate-900">
            Make the business call with more confidence.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-slate-600">
            Run a suburb-level startup check or a growth diagnosis for an existing business, then move with clearer evidence and fewer avoidable mistakes.
          </p>
          <Link href="/analyze" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md">
            Start your Australian report <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <div className="mb-1 font-display text-lg font-bold text-slate-900">
                GlobalBiz <span className="gradient-text">AI</span>
              </div>
              <p className="text-sm text-slate-500">Built for Australian founders</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <Link href="/analyze" className="transition-colors hover:text-slate-900">New report</Link>
              <Link href="/existing" className="transition-colors hover:text-slate-900">Grow existing</Link>
              <Link href="/explore" className="transition-colors hover:text-slate-900">Explore</Link>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            © 2025 GlobalBiz AI. Built for Australian founders.
          </div>
        </div>
      </footer>
    </div>
  )
}
