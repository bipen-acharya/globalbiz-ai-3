import type { BusinessModelType, NearbyCompetitorData, NearbyPlace } from '@/types'
import { GOOGLE_MAPS_API_KEY } from '@/lib/env'
import { getCompetitorSearchProfile } from '@/lib/business-groups'
import { geocodeAustralianSuburb, getAustraliaFallbackCoordinates } from './geocode'

function getMapsKey(): string {
  const raw = process.env.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY || ''
  if (!raw || raw === 'YOUR_KEY' || raw.startsWith('YOUR_')) return ''
  return raw
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function avgOrNull(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === 'number')
  if (!valid.length) return null
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10
}

function classifyStrength(rating: number | null): NearbyPlace['competitor_strength'] {
  if (rating === null) return 'moderate'
  if (rating >= 4.2) return 'strong'
  if (rating < 3.8) return 'weak'
  return 'moderate'
}

function calculateDensity(total: number, radiusKm: number): NearbyCompetitorData['competitor_density'] {
  const density = total / (Math.PI * radiusKm * radiusKm)
  if (density < 0.5) return 'low'
  if (density < 2) return 'medium'
  if (density < 5) return 'high'
  return 'saturated'
}

function dedupeKeyByNameAndCoordinates(name: string, lat: number, lng: number) {
  return `${name.trim().toLowerCase()}_${lat.toFixed(4)}_${lng.toFixed(4)}`
}

type CompetitorSearchParams = {
  lat: number | null
  lng: number | null
  radiusKm: number
  businessType: string
  businessModelType?: BusinessModelType
  productsServices?: string
  suburb: string
  state?: string
  postcode?: string
}

export async function searchCompetitors({
  lat,
  lng,
  radiusKm,
  businessType,
  businessModelType,
  productsServices = '',
  suburb,
  state = '',
  postcode = '',
}: CompetitorSearchParams): Promise<NearbyCompetitorData> {
  const mapsKey = getMapsKey()
  if (!mapsKey) {
    console.error('[searchCompetitors] missing GOOGLE_MAPS_API_KEY')
    return {
      source: 'google',
      total_found: 0,
      competitors: [],
      avg_rating: null,
      avg_price_level: null,
      competitor_density: 'low',
      search_radius_km: radiusKm,
      strong_count: 0,
      moderate_count: 0,
      weak_count: 0,
      shopping_center_anchors: [],
      food_hotspots: [],
      local_retail_clusters: [],
    }
  }

  let center = lat !== null && lng !== null
    ? { lat, lng }
    : await geocodeAustralianSuburb(suburb, state, postcode)

  if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng)) {
    center = getAustraliaFallbackCoordinates()
  }

  const profile = getCompetitorSearchProfile(businessType, productsServices, businessModelType)
  const keywords = [...new Set([...profile.directKeywords, ...profile.indirectKeywords].filter(Boolean))]
  const placeTypes = profile.placeTypes.length ? profile.placeTypes : ['point_of_interest']

  console.log('[searchCompetitors] selected category:', businessType)
  console.log('[searchCompetitors] suburb:', suburb, state)
  console.log('[searchCompetitors] geocoded coordinates:', center.lat, center.lng)
  console.log('[searchCompetitors] mapped keywords:', keywords)

  const resultsMap = new Map<string, NearbyPlace>()
  const nameCoordinateMap = new Map<string, string>()
  let rawGoogleResults = 0

  for (const keyword of keywords) {
    for (const placeType of placeTypes) {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
      url.searchParams.set('location', `${center.lat},${center.lng}`)
      url.searchParams.set('radius', String(radiusKm * 1000))
      url.searchParams.set('keyword', keyword)
      if (placeType && placeType !== 'point_of_interest' && placeType !== 'establishment') {
        url.searchParams.set('type', placeType)
      }
      url.searchParams.set('key', mapsKey)

      const response = await fetch(url.toString(), { next: { revalidate: 3600 } })
      if (!response.ok) {
        console.error('[searchCompetitors] google request failed:', response.status, keyword, placeType)
        continue
      }

      const json = await response.json()
      if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
        console.error('[searchCompetitors] Places API error:', json.status, json.error_message ?? '', `(keyword: ${keyword}, type: ${placeType})`)
        if (json.status === 'REQUEST_DENIED') {
          console.error(
            '[searchCompetitors] REQUEST_DENIED — checklist:\n' +
            '  1. Is GOOGLE_MAPS_API_KEY set to a real key (not YOUR_KEY)?\n' +
            '  2. Is "Places API" enabled in Google Cloud Console?\n' +
            '  3. Is billing enabled on the project?\n' +
            '  4. Are key restrictions blocking this server IP? (remove IP restrictions for dev)'
          )
        }
        if (json.status === 'INVALID_REQUEST') {
          console.error('[searchCompetitors] INVALID_REQUEST — check that lat/lng are valid numbers and radius is in meters')
        }
        continue
      }

      rawGoogleResults += json.results?.length ?? 0

      for (const item of json.results ?? []) {
        const location = item.geometry?.location
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') continue

        const placeId = String(item.place_id ?? '')
        const nameLatLngKey = dedupeKeyByNameAndCoordinates(String(item.name ?? ''), location.lat, location.lng)
        const canonicalKey = placeId || nameCoordinateMap.get(nameLatLngKey) || nameLatLngKey

        if (!nameCoordinateMap.has(nameLatLngKey)) {
          nameCoordinateMap.set(nameLatLngKey, canonicalKey)
        }

        const rating = typeof item.rating === 'number' ? item.rating : null
        const existing = resultsMap.get(canonicalKey)

        resultsMap.set(canonicalKey, {
          place_id: canonicalKey,
          name: String(item.name ?? existing?.name ?? 'Nearby business'),
          rating,
          review_count: typeof item.user_ratings_total === 'number' ? item.user_ratings_total : null,
          price_level: typeof item.price_level === 'number' ? item.price_level : null,
          address: String(item.vicinity ?? item.formatted_address ?? existing?.address ?? ''),
          lat: location.lat,
          lng: location.lng,
          open_now: typeof item.opening_hours?.open_now === 'boolean' ? item.opening_hours.open_now : null,
          categories: Array.isArray(item.types) ? item.types.slice(0, 4) : [],
          distance_km: Math.round(haversineKm(center.lat, center.lng, location.lat, location.lng) * 100) / 100,
          competitor_strength: classifyStrength(rating),
          direct_or_indirect: profile.directKeywords.includes(keyword) ? 'direct' : 'indirect',
          match_type: profile.directKeywords.includes(keyword) ? 'direct' : 'indirect',
        } as NearbyPlace & { direct_or_indirect?: 'direct' | 'indirect' })
      }
    }
  }

  const competitors = [...resultsMap.values()]
    .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
    .slice(0, 25)

  const strongCount = competitors.filter(item => item.competitor_strength === 'strong').length
  const weakCount = competitors.filter(item => item.competitor_strength === 'weak').length
  const moderateCount = Math.max(0, competitors.length - strongCount - weakCount)

  console.log('[searchCompetitors] raw Google results count:', rawGoogleResults)
  console.log('[searchCompetitors] deduplicated results count:', competitors.length)
  console.log('[searchCompetitors] final competitor stats:', {
    total: competitors.length,
    strong: strongCount,
    moderate: moderateCount,
    weak: weakCount,
  })

  return {
    source: 'google',
    total_found: competitors.length,
    competitors,
    avg_rating: avgOrNull(competitors.map(item => item.rating)),
    avg_price_level: avgOrNull(competitors.map(item => item.price_level)),
    competitor_density: calculateDensity(competitors.length, radiusKm),
    search_radius_km: radiusKm,
    strong_count: strongCount,
    moderate_count: moderateCount,
    weak_count: weakCount,
    shopping_center_anchors: competitors
      .filter(item => /shopping|centre|center|mall|plaza|westfield/i.test(`${item.name} ${item.address}`))
      .slice(0, 5)
      .map(item => item.name),
    food_hotspots: competitors
      .filter(item => /restaurant|cafe|café|bakery|fast_food|meal_takeaway/i.test(item.categories.join(' ')))
      .slice(0, 5)
      .map(item => item.name),
    local_retail_clusters: competitors
      .filter(item => /store|market|retail|department_store|shopping_mall/i.test(item.categories.join(' ')))
      .slice(0, 5)
      .map(item => item.name),
  }
}
