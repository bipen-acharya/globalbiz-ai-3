/**
 * AI Provider abstraction
 *
 * Priority:  ANTHROPIC_API_KEY → claude-opus-4-6 (paid, highest quality)
 *            GROQ_API_KEY      → llama-3.3-70b-versatile (free tier)
 *
 * Groq free limits: 30 req/min · 14 400 req/day · 6 000 tokens/min
 * Sign up: https://console.groq.com
 */

import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

export type Provider = "anthropic" | "groq";

export interface ProviderConfig {
  provider: Provider;
  model: string;
  label: string;       // human-readable
  free: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function isReal(key: string | undefined): key is string {
  return (
    typeof key === "string" &&
    key.length > 20 &&
    key !== "sk-ant-..." &&
    key !== "sk-ant-YOUR_REAL_KEY_HERE" &&
    !key.includes("YOUR")
  );
}

export function detectProvider(): ProviderConfig | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (isReal(anthropicKey)) {
    return { provider: "anthropic", model: "claude-opus-4-6", label: "Claude claude-opus-4-6", free: false };
  }
  if (isReal(groqKey)) {
    return { provider: "groq", model: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)", free: true };
  }
  return null;
}

// ─── stream factory ────────────────────────────────────────────────────────────

/**
 * Returns a ReadableStream that emits SSE events:
 *   data: {"text":"..."}\n\n
 *   data: {"done":true}\n\n
 *   data: {"error":"..."}\n\n
 */
export function createChatStream(
  config: ProviderConfig,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): ReadableStream {
  const encoder = new TextEncoder();

  function send(controller: ReadableStreamDefaultController, payload: object) {
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
    );
  }

  return new ReadableStream({
    async start(controller) {
      try {
        if (config.provider === "anthropic") {
          await streamAnthropic(controller, send, systemPrompt, messages);
        } else {
          await streamGroq(controller, send, systemPrompt, messages);
        }
        send(controller, { done: true });
      } catch (err: unknown) {
        console.error(`[VisaGuide ${config.provider} error]`, err);
        send(controller, { error: friendlyError(err, config.provider) });
      } finally {
        controller.close();
      }
    },
  });
}

// ─── Anthropic streaming ───────────────────────────────────────────────────────

async function streamAnthropic(
  controller: ReadableStreamDefaultController,
  send: (c: ReadableStreamDefaultController, p: object) => void,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta" &&
      event.delta.text
    ) {
      send(controller, { text: event.delta.text });
    }
  }
}

// ─── Groq streaming ────────────────────────────────────────────────────────────

async function streamGroq(
  controller: ReadableStreamDefaultController,
  send: (c: ReadableStreamDefaultController, p: object) => void,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) send(controller, { text });
  }
}

// ─── Error messages ────────────────────────────────────────────────────────────

function friendlyError(err: unknown, provider: Provider): string {
  if (provider === "anthropic") {
    if (err instanceof Anthropic.AuthenticationError)
      return "Invalid Anthropic API key. Go to /setup to update it.";
    if (err instanceof Anthropic.RateLimitError)
      return "Rate limit hit — wait a few seconds and try again.";
    if (err instanceof Anthropic.APIError)
      return `Anthropic error ${err.status}: ${err.message}`;
  }
  if (provider === "groq") {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("401") || msg.includes("Invalid API Key"))
      return "Invalid Groq API key. Go to /setup to update it.";
    if (msg.includes("429"))
      return "Groq free tier rate limit hit — wait a moment and retry.";
    return `Groq error: ${msg}`;
  }
  return err instanceof Error ? err.message : "Unexpected error — please retry.";
}
