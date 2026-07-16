// ─────────────────────────────────────────────────────────────────────────────
// News Service — aggregates Australian business news from public RSS feeds.
//
// Zero dependencies: fetches RSS XML and parses it with a small hand-rolled
// extractor (title / link / pubDate / description are all we need).
// Categorisation is keyword-driven. Pages consume this via ISR (1h revalidate),
// so feeds are hit at most once per hour regardless of traffic.
// ─────────────────────────────────────────────────────────────────────────────

export type NewsCategory =
  | 'all'
  | 'tech'
  | 'food'
  | 'retail'
  | 'health'
  | 'trades'
  | 'events'
  | 'finance'
  | 'grants'
  | 'startups'

export interface NewsArticle {
  title: string
  link: string
  source: string
  publishedAt: string // ISO
  summary: string
  category: Exclude<NewsCategory, 'all'>
}

export const NEWS_CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: 'all', label: 'All news' },
  { id: 'startups', label: 'Startups' },
  { id: 'tech', label: 'Technology & IT' },
  { id: 'food', label: 'Food & Hospitality' },
  { id: 'retail', label: 'Retail & Fashion' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'trades', label: 'Trades & Construction' },
  { id: 'finance', label: 'Finance & Property' },
  { id: 'grants', label: 'Grants & Funding' },
  { id: 'events', label: 'Events & Entertainment' },
]

const FEEDS: { url: string; source: string }[] = [
  { url: 'https://www.smartcompany.com.au/feed/', source: 'SmartCompany' },
  { url: 'https://www.startupdaily.net/feed/', source: 'Startup Daily' },
  { url: 'https://www.abc.net.au/news/feed/51892/rss.xml', source: 'ABC Business' },
  { url: 'https://insideretail.com.au/feed', source: 'Inside Retail' },
  { url: 'https://www.hospitalitymagazine.com.au/feed/', source: 'Hospitality Magazine' },
]

// Keyword → category mapping, checked in order (first match wins)
const CATEGORY_RULES: { category: Exclude<NewsCategory, 'all'>; keywords: RegExp }[] = [
  { category: 'grants', keywords: /\bgrants?\b|funding round|government support|subsid(y|ies)|tax incentive/i },
  { category: 'food', keywords: /restaurant|caf[eé]|food|hospitality|dining|coffee|bar\b|brewer|menu|chef|catering|food truck/i },
  { category: 'retail', keywords: /retail|fashion|clothing|apparel|e-?commerce|shopify|store|boutique|shopping/i },
  { category: 'health', keywords: /health|wellness|fitness|gym|medical|clinic|pharma|mental health|allied health/i },
  { category: 'trades', keywords: /construction|builder|trade(s|ie)|plumb|electric|renovation|housing suppl|infrastructure/i },
  { category: 'events', keywords: /festival|event|concert|expo|conference|entertainment|tourism|venue/i },
  { category: 'finance', keywords: /interest rate|rba|property|real estate|bank|superannuation|inflation|asx|invest|lending|mortgage/i },
  { category: 'tech', keywords: /\bai\b|artificial intelligence|software|tech|saas|cyber|digital|app\b|cloud|data|it\b/i },
  { category: 'startups', keywords: /startup|founder|venture|seed round|series [ab]|accelerat|incubat|pitch/i },
]

function categorise(title: string, description: string): Exclude<NewsCategory, 'all'> {
  const text = `${title} ${description}`
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(text)) return rule.category
  }
  return 'startups'
}

// ── Minimal RSS parsing ───────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(xml)
  if (cdata) return cdata[1].trim()
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml)
  return plain ? plain[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#8217;/g, "'")
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFeed(xml: string, source: string): NewsArticle[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? []
  const articles: NewsArticle[] = []

  for (const item of items.slice(0, 15)) {
    const title = stripHtml(extractTag(item, 'title'))
    const link = extractTag(item, 'link')
    const pubDate = extractTag(item, 'pubDate')
    const rawDescription = extractTag(item, 'description')
    const summary = stripHtml(rawDescription).slice(0, 220)

    if (!title || !link) continue

    const published = pubDate ? new Date(pubDate) : new Date()
    if (isNaN(published.getTime())) continue

    articles.push({
      title,
      link,
      source,
      publishedAt: published.toISOString(),
      summary,
      category: categorise(title, summary),
    })
  }

  return articles
}

async function fetchFeed(url: string, source: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GlobalBizAI-News/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 }, // Next.js data cache — 1 hour
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseFeed(xml, source)
  } catch (err) {
    console.warn(`[news] feed failed (${source}):`, err instanceof Error ? err.message : err)
    return []
  }
}

/** All articles from all feeds, newest first. Individual feed failures are skipped. */
export async function fetchAllNews(): Promise<NewsArticle[]> {
  const results = await Promise.all(FEEDS.map(f => fetchFeed(f.url, f.source)))
  const seven_days_ago = Date.now() - 7 * 24 * 3600 * 1000

  return results
    .flat()
    .filter(a => new Date(a.publishedAt).getTime() > seven_days_ago)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
