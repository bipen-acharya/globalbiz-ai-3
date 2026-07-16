'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NewsFeed — client view for /news. Category tabs, news cards, events tab.
// Auto-refreshes hourly while open via router.refresh() (pulls latest ISR data).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Clock, Newspaper } from 'lucide-react'
import { NEWS_CATEGORIES, type NewsArticle, type NewsCategory } from '@/services/newsService'
import type { BusinessEvent } from '@/data/australia-events'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

interface NewsFeedProps {
  articles: NewsArticle[]
  events: BusinessEvent[]
  generatedAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  NEWS_CATEGORIES.map(c => [c.id, c.label])
)

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="mb-2 flex items-center gap-2 text-xs" style={{ color: 'var(--paper-4)' }}>
        <span className="font-semibold" style={{ color: 'var(--gold)' }}>{article.source}</span>
        <span>·</span>
        <Clock size={11} />
        <span>{timeAgo(article.publishedAt)}</span>
      </div>
      <h3 className="text-[0.95rem] font-semibold leading-snug" style={{ color: 'var(--paper)' }}>
        {article.title}
      </h3>
      {article.summary && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>
          {article.summary}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
          {CATEGORY_LABEL[article.category] ?? article.category}
        </span>
        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color: 'var(--paper-4)' }} />
      </div>
    </a>
  )
}

function EventCard({ event }: { event: BusinessEvent }) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--ink-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="mb-2 flex items-center gap-2 text-xs" style={{ color: 'var(--paper-4)' }}>
        <span className="rounded-full px-2 py-0.5 font-medium"
          style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
          {event.category}
        </span>
        <span>{event.timing}</span>
      </div>
      <h3 className="text-[0.95rem] font-semibold leading-snug" style={{ color: 'var(--paper)' }}>
        {event.name}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--paper-3)' }}>
        {event.description}
      </p>
      <div className="mt-auto flex items-center justify-between pt-3 text-xs" style={{ color: 'var(--paper-4)' }}>
        <span>{event.location}</span>
        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  )
}

export function NewsFeed({ articles, events, generatedAt }: NewsFeedProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'news' | 'events'>('news')
  const [category, setCategory] = useState<NewsCategory>('all')

  // Silent hourly refresh while the page stays open
  useEffect(() => {
    const t = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS)
    return () => clearInterval(t)
  }, [router])

  const filtered = useMemo(
    () => (category === 'all' ? articles : articles.filter(a => a.category === category)),
    [articles, category]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: articles.length }
    for (const a of articles) map[a.category] = (map[a.category] ?? 0) + 1
    return map
  }, [articles])

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-1)', color: 'var(--paper)' }}>
      {/* Nav */}
      <nav className="nav-blur sticky top-0 z-40 flex items-center justify-between px-6 py-3.5">
        <Link href="/" className="font-display text-base font-bold" style={{ color: 'var(--paper)' }}>
          GlobalBiz <span style={{ color: 'var(--gold)' }}>AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/explore" className="btn btn-ghost text-sm">Explore</Link>
          <Link href="/analyze" className="btn btn-gold text-sm">Generate report</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.18)' }}>
            Updated hourly
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--paper)' }}>
            Australian business news
          </h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: 'var(--paper-3)' }}>
            What matters this week for founders — from trusted Australian sources, categorised by industry.
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--paper-4)' }}>
            Last refreshed {timeAgo(generatedAt)} · Sources: SmartCompany, Startup Daily, ABC Business, Inside Retail, Hospitality Magazine
          </p>
        </header>

        {/* News / Events tab switch */}
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('news')}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={tab === 'news'
              ? { background: 'var(--gold)', color: '#fff' }
              : { background: 'var(--ink-0)', color: 'var(--paper-2)', border: '1px solid var(--line-2)' }}
          >
            <Newspaper size={14} /> News
          </button>
          <button
            type="button"
            onClick={() => setTab('events')}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={tab === 'events'
              ? { background: 'var(--gold)', color: '#fff' }
              : { background: 'var(--ink-0)', color: 'var(--paper-2)', border: '1px solid var(--line-2)' }}
          >
            <CalendarDays size={14} /> Events
          </button>
        </div>

        {tab === 'news' && (
          <>
            {/* Category filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {NEWS_CATEGORIES.map(c => {
                const active = category === c.id
                const count = counts[c.id] ?? 0
                if (c.id !== 'all' && count === 0) return null
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                    style={active
                      ? { background: 'var(--gold-soft)', color: 'var(--gold)', border: '1px solid rgba(79,70,229,0.3)' }
                      : { background: 'var(--ink-0)', color: 'var(--paper-3)', border: '1px solid var(--line-2)' }}
                  >
                    {c.label} <span style={{ opacity: 0.6 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Articles */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((a, i) => <ArticleCard key={`${a.link}-${i}`} article={a} />)}
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center"
                style={{ background: 'var(--ink-0)', border: '1px solid var(--line)' }}>
                <p className="text-sm" style={{ color: 'var(--paper-3)' }}>
                  {articles.length === 0
                    ? 'News feeds are being fetched — check back in a few minutes.'
                    : 'No articles in this category this week.'}
                </p>
              </div>
            )}
          </>
        )}

        {tab === 'events' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(e => <EventCard key={e.name} event={e} />)}
          </div>
        )}
      </main>
    </div>
  )
}
