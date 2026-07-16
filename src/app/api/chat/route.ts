import { NextRequest, NextResponse } from 'next/server'
import { chat, type ChatMessage } from '@/services/chatService'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }
    const reply = await chat(messages)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 })
  }
}
