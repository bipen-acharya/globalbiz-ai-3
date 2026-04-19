import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

// ─── .env.local helpers ────────────────────────────────────────────────────────

function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) return {};
  const result: Record<string, string> = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return result;
}

function writeEnvFile(vars: Record<string, string>) {
  fs.writeFileSync(
    ENV_PATH,
    Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n",
    "utf-8"
  );
}

function isRealKey(key: string | undefined): boolean {
  return (
    typeof key === "string" &&
    key.length > 20 &&
    !key.includes("YOUR") &&
    key !== "sk-ant-..."
  );
}

// ─── GET — status ──────────────────────────────────────────────────────────────

export async function GET() {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const groq = process.env.GROQ_API_KEY;

  return NextResponse.json({
    anthropic: isRealKey(anthropic),
    groq: isRealKey(groq),
    configured: isRealKey(anthropic) || isRealKey(groq),
  });
}

// ─── POST — validate and save ─────────────────────────────────────────────────

export async function POST(request: Request) {
  let provider: string, apiKey: string;
  try {
    const body = await request.json();
    provider = body.provider; // "anthropic" | "groq"
    apiKey = (body.apiKey ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!provider || !["anthropic", "groq"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  // ── Provider-specific format check ─────────────────────────────────────────
  if (provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Anthropic keys start with sk-ant- — double-check you copied it correctly." },
      { status: 400 }
    );
  }
  if (provider === "groq" && !apiKey.startsWith("gsk_")) {
    return NextResponse.json(
      { error: "Groq keys start with gsk_ — double-check you copied it correctly." },
      { status: 400 }
    );
  }

  // ── Live validation ────────────────────────────────────────────────────────
  try {
    if (provider === "anthropic") {
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4,
        messages: [{ role: "user", content: "hi" }],
      });
    } else {
      const client = new Groq({ apiKey });
      const stream = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4,
        stream: true,
        messages: [{ role: "user", content: "hi" }],
      });
      // drain minimal
      for await (const _ of stream) { break; }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isAuth =
      err instanceof Anthropic.AuthenticationError ||
      msg.includes("401") ||
      msg.toLowerCase().includes("invalid api key") ||
      msg.toLowerCase().includes("invalid_api_key");

    if (isAuth) {
      return NextResponse.json(
        { error: "Key rejected by the provider — make sure you copied the full key correctly." },
        { status: 401 }
      );
    }
    // Rate-limit or other transient error: key is probably fine
    console.warn("[setup] Non-auth validation error (treating as OK):", msg);
  }

  // ── Persist ────────────────────────────────────────────────────────────────
  try {
    const existing = readEnvFile();
    if (provider === "anthropic") {
      existing["ANTHROPIC_API_KEY"] = apiKey;
      // Update the running process immediately — no restart needed
      process.env.ANTHROPIC_API_KEY = apiKey;
    } else {
      existing["GROQ_API_KEY"] = apiKey;
      // Update the running process immediately — no restart needed
      process.env.GROQ_API_KEY = apiKey;
    }
    writeEnvFile(existing);
  } catch (err) {
    console.error("[setup] Write failed:", err);
    return NextResponse.json(
      { error: "Key validated but failed to write .env.local — set it manually." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, provider });
}
