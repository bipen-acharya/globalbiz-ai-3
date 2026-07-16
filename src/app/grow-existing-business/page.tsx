'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import {
  ArrowUpRight, BarChart3, Target, Zap, TrendingUp,
  CheckCircle,
} from 'lucide-react'

const benefits = [
  { icon: BarChart3,
    title: 'Diagnose underperformance',
    desc: 'Pinpoint exactly where revenue is leaking — pricing, visibility, retention, or operations.' },
  { icon: Target,
    title: 'Find your fastest growth lever',
    desc: 'See whether suburb expansion, digital channels, better margins, or repeat revenue is the smarter next move.' },
  { icon: TrendingUp,
    title: 'Investor-style growth report',
    desc: 'Structured around confidence scores, bottlenecks, and a 90-day action plan — ready to share.' },
  { icon: Zap,
    title: 'Act on evidence, not guesswork',
    desc: 'Real competitor data, suburb demand signals, and market gap analysis — not generic advice.' },
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
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 },
    )
    document.querySelectorAll('.reveal').forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-0)', color: 'var(--paper)' }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative spotlight">
        <div className="container-text pt-24 pb-24 text-center">
          <div className="eyebrow no-rule justify-center anim-fade-up">For businesses already trading</div>
          <h1 className="display mt-8 anim-fade-up d-100" style={{ fontSize: 'var(--t-hero)' }}>
            Grow what already<br /><em>works</em>.
          </h1>
          <p className="mx-auto mt-8 max-w-xl anim-fade-up d-200" style={{ fontSize: 'var(--t-body)', color: 'var(--paper-2)' }}>
            Diagnose what&apos;s holding you back, find the fastest growth lever, and move with a clear 90-day plan — backed by real competitor data.
          </p>
          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center anim-fade-up d-300">
            <Link href="/existing" className="btn btn-gold">
              Analyse my business <ArrowUpRight size={16} />
            </Link>
            <Link href="/analyze" className="btn btn-ghost">
              Start a new business instead
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t" style={{ borderColor: 'var(--line)', background: 'var(--ink-1)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="reveal max-w-2xl">
            <div className="eyebrow">What you&apos;ll get</div>
            <h2 className="display mt-6" style={{ fontSize: 'var(--t-h1)' }}>
              Built for founders<br /><em>already in the game</em>.
            </h2>
          </div>

          <div className="mt-16 grid gap-px sm:grid-cols-2" style={{ background: 'var(--line)' }}>
            {benefits.map((b, i) => (
              <div key={b.title} className="reveal p-8" style={{ background: 'var(--ink-1)', transitionDelay: `${i * 60}ms` }}>
                <b.icon size={20} style={{ color: 'var(--gold)' }} />
                <h3 className="mt-6 font-display text-2xl">{b.title}</h3>
                <p className="mt-3" style={{ color: 'var(--paper-2)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-wide" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="reveal">
              <div className="eyebrow">In your report</div>
              <h2 className="display mt-6" style={{ fontSize: 'var(--t-h2)' }}>
                Everything you need to make<br />the next move <em>with confidence</em>.
              </h2>
              <p className="mt-6 max-w-md" style={{ color: 'var(--paper-2)' }}>
                We analyse your model, position, and local landscape to surface the highest-impact opportunities — not generic recommendations.
              </p>
              <div className="mt-10">
                <Link href="/existing" className="btn btn-gold">
                  Start your growth analysis <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="reveal" style={{ transitionDelay: '120ms' }}>
              <div className="surface p-8">
                <ul className="space-y-4">
                  {checklist.map((item, i) => (
                    <li key={item} className="flex items-start gap-3 anim-slide" style={{ animationDelay: `${i * 80}ms` }}>
                      <CheckCircle size={16} className="mt-1 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                      <span className="text-sm" style={{ color: 'var(--paper-2)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-wide flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="block h-2 w-2 rounded-full" style={{ background: 'var(--gold)' }} />
            <span className="font-display text-lg">GlobalBiz <span style={{ color: "var(--gold)" }}>AI</span></span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: 'var(--paper-3)' }}>
            <Link href="/analyze" className="hover:text-paper">New analysis</Link>
            <Link href="/explore-business-ideas" className="hover:text-paper">Explore ideas</Link>
            <Link href="/explore" className="hover:text-paper">In my area</Link>
          </div>
          <div className="text-xs" style={{ color: 'var(--paper-4)' }}>© {new Date().getFullYear()} · Made in Australia</div>
        </div>
      </footer>
    </div>
  )
}
