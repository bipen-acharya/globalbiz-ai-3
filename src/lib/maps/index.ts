import type { BusinessModelType, NearbyCompetitorData } from '@/types'
import { geocodeAustralianSuburb, getAustraliaFallbackCoordinates } from './geocode'
import { searchCompetitors } from './searchCompetitors'

export { geocodeAustralianSuburb as geocodeSuburb } from './geocode'
export async function fetchNearbyCompetitors(params: {
  lat: number | null
  lng: number | null
  radiusKm: number
  businessType: string
  businessModelType?: BusinessModelType
  productsServices?: string
  suburb: string
  state?: string
  postcode?: string
}): Promise<NearbyCompetitorData> {
  const data = await searchCompetitors(params)
  if (data.total_found > 0) return data

  const fallbackCoordinates =
    params.suburb && params.state
      ? await geocodeAustralianSuburb(params.suburb, params.state, params.postcode ?? '')
      : getAustraliaFallbackCoordinates()

  if ((params.lat === fallbackCoordinates.lat && params.lng === fallbackCoordinates.lng) || !params.suburb) {
    return data
  }

  return searchCompetitors({
    ...params,
    lat: fallbackCoordinates.lat,
    lng: fallbackCoordinates.lng,
  })
}
