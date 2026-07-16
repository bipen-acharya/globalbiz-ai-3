import { NextRequest, NextResponse } from 'next/server'
import { generateBusinessIdeas } from '@/services/ideaService'

export async function POST(req: NextRequest) {
  try {
    const { query, category } = await req.json()
    const ideas = await generateBusinessIdeas(query, category)
    return NextResponse.json({ ideas, query: query || category || 'general business' })
  } catch (error) {
    console.error('[explore-ideas] error:', error)
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}
