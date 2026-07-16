// ─────────────────────────────────────────────────────────────────────────────
// Scrape Service — pulls business info from a website URL, analysed by the
// fast AI tier (Claude Haiku / gpt-4o-mini).
// ─────────────────────────────────────────────────────────────────────────────

import { generateJSON } from './aiClient'

export interface ScrapedBusiness {
  businessName: string
  description: string
  category: string
  targetCustomers: string
  priceRange: string
  keyServices: string[]
  location: string
}

export async function scrapeWebsite(url: string): Promise<ScrapedBusiness | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-AU,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })

  // Non-2xx responses still give us a page (e.g. 403 bot-blocks),
  // so only bail out on network-level failures (caught by the caller).
  const html = await res.text()

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000)

  return generateJSON<ScrapedBusiness>(
    `Analyse this website content and extract key business information.

Website content:
${text}

Return ONLY a JSON object with these fields:
{
  "businessName": "extracted business name or empty string",
  "description": "1-2 sentence description of what this business does",
  "category": "best matching category from: Retail, Food & Beverage, Health & Wellness, Technology, Education, Professional Services, Trades & Construction, Beauty & Personal Care, Fitness, Entertainment, Other",
  "targetCustomers": "who their customers appear to be",
  "priceRange": "rough price range if detectable or empty string",
  "keyServices": ["service1", "service2", "service3"],
  "location": "city/state if mentioned or empty string"
}`,
    { tier: 'fast', maxTokens: 500 }
  )
}
