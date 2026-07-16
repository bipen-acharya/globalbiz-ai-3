// ─────────────────────────────────────────────────────────────────────────────
// Chat Service — answers founder questions about the GlobalBiz AI platform.
// ─────────────────────────────────────────────────────────────────────────────

import { generateText, type AiMessage } from './aiClient'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are the GlobalBiz AI assistant — a friendly, concise guide that helps Australian founders use the GlobalBiz AI platform.

Platform capabilities:
- Generate a full feasibility report for a new business idea (form at /analyze)
- Diagnose an existing business and surface growth opportunities (form at /existing)
- Explore ranked business ideas by keyword or category (/explore-business-ideas)
- Find under-served business opportunities in a specific suburb (/explore)

Each report includes:
- Business viability score, decision confidence score, opportunity gap score
- Real Google Maps competitor data and density analysis
- Suburb-level demand signals (Australian-calibrated)
- Permit and compliance notes for Australian councils
- 90-day action plan and expansion pathways

Tone: confident, direct, never pushy. Answer in 1–3 sentences. If asked something out of scope (legal/financial advice), gently redirect to the report flow. Mention specific routes only when relevant.`

export async function chat(messages: ChatMessage[]): Promise<string> {
  const history: AiMessage[] = messages
    .slice(-10) // limit context
    .filter((m): m is ChatMessage & { role: 'user' | 'assistant' } => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }))

  const reply = await generateText(history, {
    tier: 'fast',
    system: SYSTEM_PROMPT,
    temperature: 0.6,
    maxTokens: 300,
  })
  return reply.trim()
}
