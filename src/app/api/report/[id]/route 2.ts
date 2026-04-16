import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
  }

  // Basic UUID / temp-ID format check — prevents unnecessary DB queries
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const isTemp = id.startsWith('temp_')

  if (isTemp) {
    // Temp IDs are stored client-side only — the DB will never have them
    return NextResponse.json(
      { error: 'This report was generated without a database connection and can only be viewed in the original browser session.' },
      { status: 404 }
    )
  }

  if (!isUUID) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    const { data, error } = await db
      .from('reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[report-api] DB error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const nearbyData = data.analysis?.nearby_data ?? null

    return NextResponse.json({
      ...data,
      competitors: nearbyData?.competitors ?? [],
      competitor_stats: {
        total: nearbyData?.total_found ?? 0,
        strong: nearbyData?.strong_count ?? 0,
        moderate: nearbyData?.moderate_count ?? 0,
        weak: nearbyData?.weak_count ?? 0,
        avg_rating: nearbyData?.avg_rating ?? null,
        density: nearbyData?.competitor_density ?? 'low',
      },
    })
  } catch (err) {
    console.error('[report-api] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
