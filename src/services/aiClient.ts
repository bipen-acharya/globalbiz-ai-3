// ─────────────────────────────────────────────────────────────────────────────
// AI Client — unified provider layer.
//
// Provider selection (per request, no restart needed):
//   1. ANTHROPIC_API_KEY set  → Claude (Sonnet for reports, Haiku for light work)
//   2. OPENAI_API_KEY set     → OpenAI (gpt-4o / gpt-4o-mini)
//   3. Neither                → throws; callers fall back to rules-based output.
//
// Two model tiers:
//   'smart' — full report generation, idea generation (quality matters)
//   'fast'  — chat, scraping, summarising (cost matters)
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai'

export type ModelTier = 'smart' | 'fast'

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateOptions {
  tier?: ModelTier
  system?: string
  temperature?: number
  maxTokens?: number
}

const CLAUDE_MODELS: Record<ModelTier, string> = {
  smart: 'claude-sonnet-4-5',
  fast: 'claude-haiku-4-5',
}

const OPENAI_MODELS: Record<ModelTier, string> = {
  smart: 'gpt-4o',
  fast: 'gpt-4o-mini',
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MAX_TOKENS = 4096

let openaiCache: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (openaiCache) return openaiCache
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set')
  openaiCache = new OpenAI({ apiKey: key })
  return openaiCache
}

export function activeProvider(): 'anthropic' | 'openai' | 'none' {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'none'
}

// ── Anthropic (direct REST — no SDK dependency) ──────────────────────────────

interface AnthropicResponse {
  content: { type: string; text?: string }[]
  stop_reason: string
}

async function callAnthropic(
  messages: AiMessage[],
  opts: GenerateOptions
): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODELS[opts.tier ?? 'smart'],
      max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(opts.system ? { system: opts.system } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      messages,
    }),
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as AnthropicResponse
  const text = data.content.find(b => b.type === 'text')?.text
  if (!text) throw new Error('Empty Anthropic response')
  return text
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(
  messages: AiMessage[],
  opts: GenerateOptions,
  jsonMode: boolean
): Promise<string> {
  const completion = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODELS[opts.tier ?? 'smart'],
    messages: [
      ...(opts.system ? [{ role: 'system' as const, content: opts.system }] : []),
      ...messages,
    ],
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  })
  const text = completion.choices[0]?.message?.content?.trim()
  if (!text) throw new Error('Empty OpenAI response')
  return text
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Free-form text generation (chat, summaries). */
export async function generateText(
  messages: AiMessage[],
  opts: GenerateOptions = {}
): Promise<string> {
  const provider = activeProvider()
  if (provider === 'anthropic') return callAnthropic(messages, opts)
  if (provider === 'openai') return callOpenAI(messages, opts, false)
  throw new Error('No AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)')
}

/** Structured JSON generation. Strips markdown fences, parses, returns typed object. */
export async function generateJSON<T = Record<string, unknown>>(
  prompt: string,
  opts: GenerateOptions = {}
): Promise<T> {
  const provider = activeProvider()
  const messages: AiMessage[] = [{ role: 'user', content: prompt }]

  let raw: string
  if (provider === 'anthropic') {
    // Claude has no JSON mode flag — instruct + pre-fill pattern keeps output clean
    raw = await callAnthropic(messages, {
      ...opts,
      system: [opts.system, 'Respond with valid JSON only. No markdown fences, no commentary.']
        .filter(Boolean)
        .join('\n\n'),
    })
  } else if (provider === 'openai') {
    raw = await callOpenAI(messages, opts, true)
  } else {
    throw new Error('No AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)')
  }

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Tolerate leading prose before the first brace (rare model slip)
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in AI response')

  return JSON.parse(cleaned.slice(start, end + 1)) as T
}
