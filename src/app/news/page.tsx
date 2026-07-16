// ─────────────────────────────────────────────────────────────────────────────
// /news — Australian business news + events.
// Server component: fetches RSS feeds at build/revalidate time (ISR, 1 hour).
// Filtering and tabs are handled client-side in NewsFeed.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { fetchAllNews } from '@/services/newsService'
import { AUSTRALIAN_BUSINESS_EVENTS } from '@/data/australia-events'
import { NewsFeed } from '@/components/news/NewsFeed'

export const revalidate = 3600 // regenerate at most once per hour

export const metadata: Metadata = {
  title: 'Australian Business News — GlobalBiz AI',
  description:
    'Business news for Australian founders — startups, hospitality, retail, tech, grants, and events. Updated hourly from trusted Australian sources.',
}

export default async function NewsPage() {
  const articles = await fetchAllNews()

  return (
    <NewsFeed
      articles={articles}
      events={AUSTRALIAN_BUSINESS_EVENTS}
      generatedAt={new Date().toISOString()}
    />
  )
}
