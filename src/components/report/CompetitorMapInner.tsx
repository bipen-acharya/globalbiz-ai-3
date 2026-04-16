'use client'

import { useMemo, useState } from 'react'
import {
  Circle,
  GoogleMap,
  InfoWindow,
  MarkerF,
  useJsApiLoader,
} from '@react-google-maps/api'
import type { NearbyPlace } from '@/types'
import { priceLevelLabel } from '@/lib/utils'
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@/lib/env'

interface Props {
  lat: number
  lng: number
  radiusKm: number
  competitors: NearbyPlace[]
  suburb: string
  businessType?: string
}

const libraries: ('places')[] = ['places']
const mapContainerStyle = {
  width: '100%',
  height: '380px',
  borderRadius: '16px',
}

function markerColorForStrength(strength?: NearbyPlace['competitor_strength'], rating?: number | null) {
  const effectiveStrength =
    strength ??
    (rating !== null && rating !== undefined
      ? rating >= 4.2
        ? 'strong'
        : rating < 3.8
        ? 'weak'
        : 'moderate'
      : 'moderate')

  if (effectiveStrength === 'strong') return '#f59e0b'
  if (effectiveStrength === 'weak') return '#10b981'
  return '#2563eb'
}

function zoomForRadius(radiusKm: number) {
  if (radiusKm <= 1) return 15
  if (radiusKm <= 3) return 13
  if (radiusKm <= 5) return 12
  return 11
}

function MapSkeleton() {
  return (
    <div className="p-4">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 h-5 w-40 rounded bg-slate-200" />
        <div className="h-[380px] w-full rounded-2xl bg-slate-200" />
        <div className="mt-3 text-sm text-slate-500">Loading live competitor map...</div>
      </div>
    </div>
  )
}

function MapFallback({ suburb, message }: { suburb: string; message: string }) {
  return (
    <div className="ui-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-display font-semibold text-slate-900">Competitor map — {suburb}</span>
      </div>
      <div className="flex h-[380px] items-center justify-center bg-white p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {message}
        </div>
      </div>
    </div>
  )
}

export function CompetitorMapInner({ lat, lng, radiusKm, competitors, suburb }: Props) {
  const [selected, setSelected] = useState<NearbyPlace | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'globalbiz-google-map',
    googleMapsApiKey: apiKey,
    libraries,
  })

  const center = useMemo(() => ({ lat, lng }), [lat, lng])
  const stableCompetitors = useMemo(
    () =>
      [...(competitors ?? [])]
        .filter(item => typeof item.lat === 'number' && typeof item.lng === 'number')
        .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999)),
    [competitors]
  )
  const hasGoogleMaps = typeof window !== 'undefined' && Boolean(window.google?.maps)
  const userMarkerIcon = useMemo(() => {
    if (!isLoaded || !hasGoogleMaps) return undefined
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#10b981',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    }
  }, [hasGoogleMaps, isLoaded])

  if (process.env.NODE_ENV === 'development') {
    console.log('Maps key exists:', !!apiKey)
    console.log('Competitors loaded:', stableCompetitors.length)
  }

  if (!apiKey || apiKey === 'YOUR_KEY') {
    return <MapFallback suburb={suburb} message="Map is temporarily unavailable. Competitor data is still included below." />
  }

  if (loadError) {
    console.error('[CompetitorMapInner] map load error', loadError)
    return <MapFallback suburb={suburb} message="Google Maps failed to load" />
  }

  if (!isLoaded || typeof window === 'undefined' || !window.google || !hasGoogleMaps) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <span className="text-sm font-display font-semibold text-slate-900">Competitor map — {suburb}</span>
        </div>
        <MapSkeleton />
      </div>
    )
  }

  return (
    <div className="ui-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-display font-semibold text-slate-900">Competitor map — {suburb}</span>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Your location
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Strong
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600" /> Moderate
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" /> Weak
          </span>
        </div>
      </div>

      <div className="relative bg-white p-4">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoomForRadius(radiusKm)}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => {
            console.log('Map init success')
            const bounds = new window.google.maps.LatLngBounds()
            bounds.extend(center)
            stableCompetitors.forEach(competitor => bounds.extend({ lat: competitor.lat, lng: competitor.lng }))
            if (stableCompetitors.length > 0) {
              map.fitBounds(bounds)
            }
          }}
        >
          <Circle
            center={center}
            radius={radiusKm * 1000}
            options={{
              strokeColor: '#10b981',
              strokeOpacity: 0.55,
              strokeWeight: 2,
              fillColor: '#10b981',
              fillOpacity: 0.07,
            }}
          />

          <MarkerF
            position={center}
            title={`Selected location: ${suburb}`}
            icon={userMarkerIcon}
          />

          {stableCompetitors.map((competitor, index) => (
            <MarkerF
              key={competitor.place_id}
              position={{ lat: competitor.lat, lng: competitor.lng }}
              title={competitor.name}
              label={{
                text: String(index + 1),
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
              }}
              icon={hasGoogleMaps ? {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: markerColorForStrength(competitor.competitor_strength, competitor.rating),
                fillOpacity: 0.95,
                strokeColor: '#ffffff',
                strokeWeight: 1.5,
              } : undefined}
              onClick={() => setSelected(competitor)}
            />
          ))}

          {selected && (
            <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
              <div className="min-w-[220px] p-1 text-slate-900">
                <div className="mb-1 text-sm font-semibold">{selected.name}</div>
                <div className="mb-2 text-xs text-slate-500">{selected.address}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selected.rating !== null ? <span className="text-amber-600">{selected.rating.toFixed(1)}★</span> : null}
                  {selected.review_count !== null ? <span className="text-slate-500">{selected.review_count} reviews</span> : null}
                  {selected.distance_km !== null ? <span className="text-slate-500">{selected.distance_km}km</span> : null}
                  <span className="capitalize text-slate-500">{selected.competitor_strength ?? 'moderate'}</span>
                  {selected.price_level !== null ? <span className="text-slate-500">{priceLevelLabel(selected.price_level)}</span> : null}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {stableCompetitors.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-600 shadow-sm">
            No direct nearby competitors found in selected radius.
          </div>
        ) : null}
      </div>
    </div>
  )
}
