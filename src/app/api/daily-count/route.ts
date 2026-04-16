import { NextResponse } from 'next/server'

const LIMIT = parseInt(process.env.DAILY_REPORT_LIMIT ?? '10', 10)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      // No DB configured — return full limit so the UI doesn't block
      return NextResponse.json({ count: 0, limit: LIMIT, remaining: LIMIT, date: today })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data } = await db
      .from('daily_usage')
      .select('count, limit_val')
      .eq('usage_date', today)
      .maybeSingle()

    const count = data?.count ?? 0
    const limit = data?.limit_val ?? LIMIT
    const remaining = Math.max(0, limit - count)

    return NextResponse.json({ count, limit, remaining, date: today })
  } catch (err) {
    console.error('[daily-count]', err)
    return NextResponse.json({ count: 0, limit: LIMIT, remaining: LIMIT, date: today })
  }
}
