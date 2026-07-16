// ─────────────────────────────────────────────────────────────────────────────
// Chat Service — answers founder questions about the GlobalBiz AI platform.
// ─────────────────────────────────────────────────────────────────────────────

import { generateText, type AiMessage } from './aiClient'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are the GlobalBiz AI assistant — a friendly, concise guide that helps Australian founders use the GlobalBiz AI platform.

Platform pages (refer to them by plain name, e.g. "the Explore page"):
- Analyze — full feasibility report for a new business idea
- Grow — diagnose an existing business and surface growth opportunities
- Business Ideas — ranked business ideas by keyword or category
- Explore — competitor density for any business type in any Australian suburb
- News — Australian business news, updated hourly
- Market Intelligence — industry survival rates and state-by-state trends

Each report includes viability and confidence scores, real Google Maps competitor data, suburb-level demand signals, Australian permit notes, and a 90-day action plan.

STRICT RULES:
- Maximum 2 short sentences per reply. Never more.
- Plain text only. Never use markdown — no asterisks, no bold, no bullet lists, no headings, no links.
- Refer to pages by name only ("the Explore page"), never by URL or path.
- Confident and direct, never pushy. If asked for legal or financial advice, say you can't give it and point to the report instead.`

export async function chat(messages: ChatMessage[]): Promise<string> {
  const history: AiMessage[] = messages
    .slice(-10) // limit context
    .filter((m): m is ChatMessage & { role: 'user' | 'assistant' } => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }))

  const reply = await generateText(history, {
    tier: 'fast',
    system: SYSTEM_PROMPT,
    temperature: 0.6,
    maxTokens: 200,
  })
  return stripMarkdown(reply.trim())
}

/** Safety net — models occasionally slip markdown in despite instructions. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')     // italic
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')       // inline code
    .replace(/^#{1,6}\s+/gm, '')       // headings
    .replace(/^\s*[-•]\s+/gm, '')      // bullets
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → label
}
