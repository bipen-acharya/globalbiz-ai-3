import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite } from '@/services/scrapeService'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const data = await scrapeWebsite(url)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[scrape-website] error:', error)
    return NextResponse.json({ success: false, data: null })
  }
}
