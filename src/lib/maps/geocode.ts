import { GOOGLE_MAPS_API_KEY } from '@/lib/env'

const AUSTRALIA_CBD_FALLBACK = { lat: -34.9285, lng: 138.6007 }

const geocodeCache = new Map<string, { lat: number; lng: number }>()

function getMapsKey(): string {
  const raw = process.env.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY || ''
  if (!raw || raw === 'YOUR_KEY' || raw.startsWith('YOUR_')) return ''
  return raw
}

export function getAustraliaFallbackCoordinates() {
  return AUSTRALIA_CBD_FALLBACK
}

export async function geocodeAustralianSuburb(
  suburb: string,
  state: string,
  postcode = ''
): Promise<{ lat: number; lng: number }> {
  const cacheKey = `${suburb}|${state}|${postcode}`.toLowerCase()
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  const key = getMapsKey()
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[geocode] missing GOOGLE_MAPS_API_KEY, using Adelaide CBD fallback')
    }
    return AUSTRALIA_CBD_FALLBACK
  }

  const query = encodeURIComponent(`${suburb} ${postcode} ${state} Australia`)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&components=country:AU&key=${key}`

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } })
    const json = await response.json()

    if (json.status === 'OK' && json.results?.[0]?.geometry?.location) {
      const coordinates = {
        lat: Number(json.results[0].geometry.location.lat),
        lng: Number(json.results[0].geometry.location.lng),
      }
      geocodeCache.set(cacheKey, coordinates)
      return coordinates
    }

    console.error('[geocode] geocoding failed:', json.status, json.error_message ?? '')
    return AUSTRALIA_CBD_FALLBACK
  } catch (error) {
    console.error('[geocode] request failed:', error)
    return AUSTRALIA_CBD_FALLBACK
  }
}
