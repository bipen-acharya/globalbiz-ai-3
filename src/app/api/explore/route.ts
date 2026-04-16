import { NextRequest, NextResponse } from 'next/server'
import { fetchNearbyCompetitors } from '@/lib/maps'
import type { NearbyCompetitorData } from '@/types'

function jsonError(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const latRaw = searchParams.get('lat')
  const lngRaw = searchParams.get('lng')
  const radiusRaw = searchParams.get('radius_km')
  const businessType = searchParams.get('business_type') ?? ''
  const suburb = searchParams.get('suburb') ?? ''
  const state = searchParams.get('state') ?? ''
  const postcode = searchParams.get('postcode') ?? ''

  const lat = latRaw !== null ? parseFloat(latRaw) : null
  const lng = lngRaw !== null ? parseFloat(lngRaw) : null
  const radiusKm = radiusRaw !== null ? parseFloat(radiusRaw) : 3

  if (!businessType) {
    return jsonError('business_type is required', 400)
  }

  if (isNaN(radiusKm) || radiusKm <= 0) {
    return jsonError('radius_km must be a positive number', 400)
  }

  try {
    const data: NearbyCompetitorData = await fetchNearbyCompetitors({
      lat,
      lng,
      radiusKm,
      businessType,
      suburb,
      state,
      postcode,
    })

    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/explore] fetchNearbyCompetitors error:', err)
    return jsonError('Failed to fetch nearby businesses', 500)
  }
}
