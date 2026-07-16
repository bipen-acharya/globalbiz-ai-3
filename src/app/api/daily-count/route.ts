// ─────────────────────────────────────────────────────────────────────────────
// GET /api/daily-count — current usage status (no increment).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getUsageStatus } from '@/services/usageStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = await getUsageStatus()
  return NextResponse.json({
    count: status.dailyCount,
    limit: status.dailyLimit,
    remaining: Math.max(0, status.dailyLimit - status.dailyCount),
    total: status.total,
    totalLimit: status.totalLimit,
    totalRemaining: Math.max(0, status.totalLimit - status.total),
    paused: status.total >= status.totalLimit,
  })
}
