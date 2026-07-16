// ─────────────────────────────────────────────────────────────────────────────
// Usage Store — persistent report counters.
//
// Tracks two limits:
//   • Total lifetime reports (TOTAL_REPORT_LIMIT, default 100) — the free-beta
//     cap. When reached, report generation pauses and users see /coming-soon.
//   • Daily reports (DAILY_REPORT_LIMIT, default 50) — cost protection.
//
// Storage backends (auto-selected):
//   1. Upstash Redis  — when UPSTASH_REDIS_REST_URL + TOKEN are set.
//                       Correct choice for Vercel/serverless (multi-instance).
//   2. Local JSON file — default. Survives restarts on a single machine.
//                       Fine for localhost and single-server deploys.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from 'fs'
import path from 'path'

const TOTAL_LIMIT = parseInt(process.env.TOTAL_REPORT_LIMIT ?? '100', 10)
const DAILY_LIMIT = parseInt(process.env.DAILY_REPORT_LIMIT ?? '50', 10)

const FILE_PATH = path.join(process.cwd(), '.usage-store.json')

interface UsageData {
  total: number
  daily: Record<string, number> // date → count
}

export interface UsageStatus {
  allowed: boolean
  reason: 'ok' | 'TOTAL_LIMIT_REACHED' | 'DAILY_LIMIT_REACHED'
  total: number
  totalLimit: number
  dailyCount: number
  dailyLimit: number
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Upstash Redis backend ─────────────────────────────────────────────────────

function hasRedis(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  const json = (await res.json()) as { result: unknown }
  return json.result
}

async function redisRead(): Promise<{ total: number; dailyCount: number }> {
  const [total, dailyCount] = await Promise.all([
    redisCommand(['GET', 'gb:reports:total']),
    redisCommand(['GET', `gb:reports:daily:${today()}`]),
  ])
  return {
    total: parseInt(String(total ?? '0'), 10) || 0,
    dailyCount: parseInt(String(dailyCount ?? '0'), 10) || 0,
  }
}

async function redisIncrement(): Promise<void> {
  const dailyKey = `gb:reports:daily:${today()}`
  await Promise.all([
    redisCommand(['INCR', 'gb:reports:total']),
    redisCommand(['INCR', dailyKey]),
  ])
  // Expire daily keys after 48h so they clean themselves up
  await redisCommand(['EXPIRE', dailyKey, 172800]).catch(() => {})
}

// ── File backend ──────────────────────────────────────────────────────────────

async function fileRead(): Promise<UsageData> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as UsageData
    return { total: parsed.total ?? 0, daily: parsed.daily ?? {} }
  } catch {
    return { total: 0, daily: {} }
  }
}

async function fileWrite(data: UsageData): Promise<void> {
  // Keep only today's daily entry to stop the file growing
  const trimmed: UsageData = { total: data.total, daily: { [today()]: data.daily[today()] ?? 0 } }
  await fs.writeFile(FILE_PATH, JSON.stringify(trimmed), 'utf8')
}

// ── Public API ────────────────────────────────────────────────────────────────

function buildStatus(total: number, dailyCount: number): UsageStatus {
  if (total >= TOTAL_LIMIT) {
    return { allowed: false, reason: 'TOTAL_LIMIT_REACHED', total, totalLimit: TOTAL_LIMIT, dailyCount, dailyLimit: DAILY_LIMIT }
  }
  if (dailyCount >= DAILY_LIMIT) {
    return { allowed: false, reason: 'DAILY_LIMIT_REACHED', total, totalLimit: TOTAL_LIMIT, dailyCount, dailyLimit: DAILY_LIMIT }
  }
  return { allowed: true, reason: 'ok', total, totalLimit: TOTAL_LIMIT, dailyCount, dailyLimit: DAILY_LIMIT }
}

/** Current usage without incrementing. */
export async function getUsageStatus(): Promise<UsageStatus> {
  if (hasRedis()) {
    const { total, dailyCount } = await redisRead()
    return buildStatus(total, dailyCount)
  }
  const data = await fileRead()
  return buildStatus(data.total, data.daily[today()] ?? 0)
}

/** Check limits and, if allowed, record one report. */
export async function checkAndRecordReport(): Promise<UsageStatus> {
  const status = await getUsageStatus()
  if (!status.allowed) return status

  if (hasRedis()) {
    await redisIncrement()
  } else {
    const data = await fileRead()
    data.total += 1
    data.daily[today()] = (data.daily[today()] ?? 0) + 1
    await fileWrite(data)
  }

  return buildStatus(status.total + 1, status.dailyCount + 1)
}
