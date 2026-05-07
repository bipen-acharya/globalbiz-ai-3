'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, TrendingUp, BarChart3, Target, Zap, CheckCircle } from 'lucide-react'

const benefits = [
  {
    icon: BarChart3,
    title: 'Diagnose underperformance',
    desc: 'Pinpoint exactly where revenue is leaking — pricing, visibility, retention, or operations.',
  },
  {
    icon: Target,
    title: 'Find your fastest growth lever',
    desc: 'See whether suburb expansion, digital channels, better margins, or repeat revenue is the smarter next move.',
  },
  {
    icon: TrendingUp,
    title: 'Investor-style growth report',
    desc: 'Structured around confidence scores, bottlenecks, and a 90-day action plan — ready to share.',
  },
  {
    icon: Zap,
    title: 'Act on evidence, not guesswork',
    desc: 'Real competitor data, suburb demand signals, and market gap analysis — not generic advice.',
  },
]

const checklist = [
  'Current revenue and performance benchmarking',
  'Competitor landscape and threat mapping',
  'Suburb expansion feasibility scoring',
  'Digital vs. physical channel analysis',
  'Pricing and margin optimisation signals',
  '90-day prioritised action plan',
]

export default function GrowExistingBusinessPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft size={16} /> Home
        </Link>
        <Link href="/" className="font-display text-lg font-bold text-slate-900">
          GlobalBiz <span className="gradient-text">AI</span>
        </Link>
        <Link href="/existing" className="ui-primary-btn">
          Get started
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white px-6 pb-20 pt-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 animate-fade-up">
            <TrendingUp size={13} />
            Growth intelligence for existing businesses
          </div>

          <h1 className="mb-6 text-5xl tracking-tight text-slate-900 sm:text-6xl animate-fade-up delay-100">
            Grow Your{' '}
            <span className="gradient-text">Existing Business</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600 animate-fade-up delay-200">
            AI-powered insights to scale what&apos;s already working. Diagnose what&apos;s holding you back, find your fastest growth lever, and move with a clear 90-day plan.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-up delay-300">
            <Link
              href="/existing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md animate-pulse-glow sm:w-auto"
            >
              Analyse my business <ArrowRight size={18} />
            </Link>
            <Link
              href="/analyze"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 sm:w-auto"
            >
              Start a new business instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── Benefits grid ── */}
      <section className="bg-slate-50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">What you&apos;ll get</p>
            <h2 className="text-3xl text-slate-900">Built for founders who are already in the game</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`card-hover rounded-xl border border-slate-200 bg-white p-6 animate-fade-up delay-${(i + 1) * 100}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <b.icon size={20} />
                </div>
                <h3 className="mb-2 text-base text-slate-900">{b.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report checklist ── */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-up">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">Your growth report includes</p>
              <h2 className="mb-6 text-3xl text-slate-900">Everything you need to make the next move with confidence</h2>
              <p className="mb-8 text-slate-600">
                We analyse your business model, current market position, and local competitive landscape to surface the highest-impact opportunities — not generic recommendations.
              </p>
              <Link
                href="/existing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md sm:w-auto"
              >
                Start your growth analysis <ArrowRight size={18} />
              </Link>
            </div>

            <div className="animate-fade-up delay-200">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <ul className="space-y-4">
                  {checklist.map((item, i) => (
                    <li key={item} className={`flex items-start gap-3 animate-fade-up delay-${(i + 1) * 100}`}>
                      <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12">
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
              <Link href="/grow-existing-business" className="transition-colors hover:text-slate-900">Grow existing</Link>
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
