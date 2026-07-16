'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import {
  ArrowUpRight, Search, MapPin, DollarSign, Clock,
  Users, Sparkles, TrendingUp,
} from 'lucide-react'

interface BusinessIdea {
  id: number
  name: string
  category: string
  tagline: string
  opportunityScore: number
  demandLevel: string
  competitorDensity: string
  estimatedStartupCost: string
  timeToProfit: string
  whyNow: string
  targetCustomer: string
}

const CATEGORIES = [
  { name: 'Food & Beverage',      glyph: '☕' },
  { name: 'Retail & Fashion',     glyph: '◇' },
  { name: 'Trades & Services',    glyph: '◆' },
  { name: 'Health & Wellness',    glyph: '◊' },
  { name: 'Tech & Digital',       glyph: '⌘' },
  { name: 'Education & Training', glyph: '✦' },
  { name: 'Home & Garden',        glyph: '✿' },
  { name: 'Auto & Transport',     glyph: '◐' },
]

const TRENDING = [
  'Bubble tea', 'Mobile pet grooming', 'EV charging station', 'Home tutoring',
  'Meal prep delivery', 'Solar installation', 'Coworking space', 'Aged care services',
]

const QUICK = ['Coffee shop', 'Mobile mechanic', 'Childcare', 'Dog grooming', 'Cleaning', 'Tutoring']

export default function ExploreBusinessIdeasPage() {
  const [query, setQuery] = useState('')
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [error, setError] = useState('')

  const handleSearch = async (searchQuery?: string) => {
    const term = (searchQuery ?? query).trim()
    if (!term) return
    setLoading(true); setError(''); setSearched(false)
    try {
      const res = await fetch('/api/explore-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setIdeas(data.ideas || [])
      setSearchedQuery(term)
      setSearched(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-0)', color: 'var(--paper)' }}>
      <SiteHeader />

      <section className="relative spotlight">
        <div className="container-text pt-20 pb-12 text-center">
          <div className="eyebrow no-rule justify-center anim-fade-up">Suburb-validated opportunities</div>
          <h1 className="display mt-6 anim-fade-up d-100" style={{ fontSize: 'var(--t-h1)' }}>
            Explore <em>business ideas</em>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl anim-fade-up d-200" style={{ color: 'var(--paper-2)' }}>
            Discover validated opportunities for the Australian market — scored against real demand, competitor density, and market gaps.
          </p>

          {/* Search */}
          <div className="mt-10 anim-fade-up d-300">
            <div className="relative mx-auto max-w-xl">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--paper-3)' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by industry or keyword…"
                className="input pl-12 pr-32 text-base"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-gold"
              >
                {loading ? <div className="spinner" /> : <><Sparkles size={14} /> Search</>}
              </button>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--paper-4)' }}>
              <MapPin size={12} /> Ranked by opportunity score for Australian conditions
            </p>
          </div>

          {!searched && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 anim-fade-up d-400">
              {QUICK.map(tag => (
                <button key={tag} onClick={() => { setQuery(tag); handleSearch(tag) }} className="chip">
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container-wide pb-20">
        {/* Loading */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="surface p-6">
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-2/3 mb-6" />
                <div className="flex gap-2"><div className="skeleton h-6 w-16" /><div className="skeleton h-6 w-20" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto mt-8 max-w-md rounded-xl border px-5 py-4 text-sm text-center anim-fade-in"
               style={{ borderColor: 'rgba(226,107,107,0.4)', background: 'rgba(226,107,107,0.08)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && ideas.length > 0 && (
          <div className="anim-fade-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="eyebrow">{ideas.length} ideas</div>
                <h2 className="mt-2 font-display text-2xl">
                  For &ldquo;<em style={{ color: 'var(--gold)' }}>{searchedQuery}</em>&rdquo;
                </h2>
              </div>
              <button onClick={() => { setSearched(false); setIdeas([]); setQuery('') }} className="text-sm" style={{ color: 'var(--paper-3)' }}>
                Clear results
              </button>
            </div>

            <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3" style={{ background: 'var(--line)' }}>
              {[...ideas].sort((a, b) => b.opportunityScore - a.opportunityScore).map((idea, i) => (
                <IdeaCard key={idea.id} idea={idea} index={i} />
              ))}
            </div>

            <div className="mt-16 surface-elevated p-10 text-center">
              <h3 className="font-display text-2xl">Found an idea you like?</h3>
              <p className="mt-3" style={{ color: 'var(--paper-2)' }}>
                Get a full feasibility report with suburb analysis, budget fit score, and competitor mapping.
              </p>
              <Link href="/analyze" className="btn btn-gold mt-8">
                Generate your founder report <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Browse */}
        {!searched && !loading && (
          <div className="mt-12 anim-fade-up d-500">
            <div className="text-center mb-10">
              <div className="eyebrow no-rule justify-center">Browse by category</div>
              <h2 className="mt-4 font-display text-2xl">What are you <em>exploring</em>?</h2>
            </div>

            <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ background: 'var(--line)' }}>
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => { setQuery(cat.name); handleSearch(cat.name) }}
                  className="group p-8 text-left transition-colors anim-fade-up"
                  style={{ background: 'var(--ink-1)', animationDelay: `${i * 60}ms` }}
                >
                  <div className="font-display text-3xl transition-colors group-hover:text-gold" style={{ color: 'var(--paper-2)' }}>
                    {cat.glyph}
                  </div>
                  <div className="mt-6 text-sm">{cat.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }}>
                    Explore <ArrowUpRight size={12} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-16 surface p-8">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={14} style={{ color: 'var(--gold)' }} />
                <span className="text-sm" style={{ color: 'var(--paper-2)' }}>Trending this week</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <button key={t} onClick={() => { setQuery(t); handleSearch(t) }} className="chip">{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IdeaCard
// ─────────────────────────────────────────────────────────────────────────────

function IdeaCard({ idea, index }: { idea: BusinessIdea; index: number }) {
  const scoreColor = idea.opportunityScore >= 85 ? 'var(--ok)' : idea.opportunityScore >= 70 ? 'var(--gold)' : 'var(--warn)'
  return (
    <div className="group p-6 flex flex-col anim-fade-up" style={{ background: 'var(--ink-1)', animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <span className="tag">{idea.category}</span>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--paper-4)' }}>Score</div>
          <div className="font-display text-2xl" style={{ color: scoreColor }}>{idea.opportunityScore}</div>
        </div>
      </div>

      <h3 className="font-display text-xl mb-2">{idea.name}</h3>
      <p className="text-sm mb-5 flex-1" style={{ color: 'var(--paper-2)' }}>{idea.tagline}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        <span className="tag">↑ {idea.demandLevel} demand</span>
        <span className="tag">{idea.competitorDensity} competition</span>
      </div>

      <div className="rule mb-4" />
      <div className="space-y-3 mb-5 text-sm">
        <Row icon={<DollarSign size={13} />} label="Startup cost" value={idea.estimatedStartupCost} />
        <Row icon={<Clock size={13} />} label="Time to profit" value={idea.timeToProfit} />
        <Row icon={<Users size={13} />} label="Target customer" value={idea.targetCustomer} />
      </div>

      <div className="rounded-lg border p-3 mb-5" style={{ borderColor: 'rgba(201,169,97,0.2)', background: 'var(--gold-soft)' }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--gold-2)' }}>Why now</div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--paper-2)' }}>{idea.whyNow}</p>
      </div>

      <Link
        href={`/analyze?idea=${encodeURIComponent(idea.name)}&category=${encodeURIComponent(idea.category)}`}
        className="btn btn-gold w-full justify-center"
      >
        Validate this idea <ArrowUpRight size={14} />
      </Link>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5" style={{ color: 'var(--paper-4)' }}>{icon}</span>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--paper-4)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--paper)' }}>{value}</div>
      </div>
    </div>
  )
}
