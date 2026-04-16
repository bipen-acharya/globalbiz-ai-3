import { NextRequest, NextResponse } from 'next/server'
import { fetchNearbyCompetitors } from '@/lib/maps'

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') ?? ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 })
    }

    const { lat, lng, radius_km, business_type, business_model_type, suburb } = await req.json()

    if (!business_type) {
      return NextResponse.json({ error: 'business_type is required' }, { status: 422 })
    }

    const data = await fetchNearbyCompetitors({
      lat:         typeof lat === 'number' ? lat : null,
      lng:         typeof lng === 'number' ? lng : null,
      radiusKm:    typeof radius_km === 'number' ? radius_km : 3,
      businessType: String(business_type),
      businessModelType: business_model_type,
      suburb:      String(suburb ?? ''),
    })

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[api/places]', err)
    return NextResponse.json({ error: 'Failed to fetch nearby places' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}
