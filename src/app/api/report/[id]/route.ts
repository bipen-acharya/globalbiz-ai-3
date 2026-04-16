import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
  }

  const isTemp = id.startsWith('temp_')
  if (isTemp) {
    return NextResponse.json(
      { error: 'This report was generated without a database connection and can only be viewed in the original browser session.' },
      { status: 404 }
    )
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
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[report-api]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
