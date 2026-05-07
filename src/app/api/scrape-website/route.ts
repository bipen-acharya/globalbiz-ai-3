import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Fetch the website HTML
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GlobalBizAI/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    // Strip HTML tags to get readable text, limit to 8000 chars
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Analyse this website content and extract key business information.

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
      }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    })

    const extracted = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json({ success: true, data: extracted })

  } catch (error) {
    console.error('Website scrape failed:', error)
    return NextResponse.json({ success: false, data: null })
  }
}
