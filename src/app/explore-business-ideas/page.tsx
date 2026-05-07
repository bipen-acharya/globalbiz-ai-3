'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Search, MapPin, TrendingUp, Coffee, ShoppingBag, Wrench, Laptop, Heart, Utensils } from 'lucide-react'

const ideaCategories = [
  { icon: Coffee,     label: 'Food & Beverage',    count: '142 ideas',  color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { icon: ShoppingBag,label: 'Retail & Fashion',   count: '98 ideas',   color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { icon: Wrench,     label: 'Trades & Services',  count: '87 ideas',   color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { icon: Laptop,     label: 'Tech & Digital',     count: '114 ideas',  color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { icon: Heart,      label: 'Health & Wellness',  count: '76 ideas',   color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { icon: Utensils,   label: 'Hospitality',        count: '63 ideas',   color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
]

const trendingIdeas = [
  { title: 'Specialty coffee subscription',    suburb: 'Inner Melbourne',   score: 82, tag: 'Low competition' },
  { title: 'Mobile dog grooming',              suburb: 'Northern Beaches',  score: 78, tag: 'High demand' },
  { title: 'Home meal prep delivery',          suburb: 'Inner Brisbane',    score: 74, tag: 'Growing market' },
  { title: 'Co-working space for creatives',   suburb: 'Surry Hills, NSW',  score: 71, tag: 'Whitespace' },
  { title: 'Sustainable clothing alterations', suburb: 'Fitzroy, VIC',      score: 69, tag: 'Trending' },
  { title: 'Kids coding classes',              suburb: 'Parramatta, NSW',   score: 67, tag: 'Underserved' },
]

export default function ExploreBusinessIdeasPage() {
  const router = useRouter()

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
        <Link href="/analyze" className="ui-primary-btn">
          Start free
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white px-6 pb-16 pt-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,70,229,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 animate-fade-up">
            <TrendingUp size={13} />
            Suburb-validated opportunities across Australia
          </div>

          <h1 className="mb-6 text-5xl tracking-tight text-slate-900 sm:text-6xl animate-fade-up delay-100">
            Explore{' '}
            <span className="gradient-text">Business Ideas</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600 animate-fade-up delay-200">
            Discover validated business opportunities tailored to your suburb and skills. Every idea is scored against real competitor density, demand signals, and local market gaps.
          </p>

          {/* Search bar */}
          <div className="mx-auto mb-6 flex max-w-xl items-center gap-3 animate-fade-up delay-300">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search by industry or keyword…"
              />
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:scale-[1.02]"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-up delay-400">
            <MapPin size={14} className="text-slate-400" />
            <span className="text-sm text-slate-500">Ideas ranked by opportunity score in your suburb</span>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">Browse by category</p>
            <h2 className="text-2xl text-slate-900">What kind of business are you exploring?</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideaCategories.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                className={`card-hover flex items-center gap-4 rounded-xl border bg-white p-5 text-left transition-all hover:border-indigo-200 animate-fade-up delay-${(i + 1) * 100}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${cat.color}`}>
                  <cat.icon size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{cat.label}</div>
                  <div className="text-sm text-slate-500">{cat.count}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ideas ── */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">Trending now</p>
              <h2 className="text-2xl text-slate-900">High-opportunity ideas this month</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingIdeas.map((idea, i) => (
              <div
                key={idea.title}
                className={`card-hover cursor-pointer rounded-xl border border-slate-200 bg-white p-5 animate-fade-up delay-${(i + 1) * 100}`}
                onClick={() => router.push('/analyze')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && router.push('/analyze')}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {idea.tag}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <div
                      className="rounded-lg px-2 py-1 text-sm font-bold"
                      style={{ background: `hsl(${idea.score + 60}, 70%, 94%)`, color: `hsl(${idea.score + 60}, 60%, 35%)` }}
                    >
                      {idea.score}
                    </div>
                  </div>
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900">{idea.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={11} /> {idea.suburb}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => router.push('/analyze')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.02]"
            >
              Generate a report for your idea <ArrowRight size={18} />
            </button>
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
              <Link href="/analyze" className="transition-colors hover:text-slate-900">Generate report</Link>
              <Link href="/grow-existing-business" className="transition-colors hover:text-slate-900">Grow existing business</Link>
              <Link href="/explore-business-ideas" className="transition-colors hover:text-slate-900">Explore business ideas</Link>
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
