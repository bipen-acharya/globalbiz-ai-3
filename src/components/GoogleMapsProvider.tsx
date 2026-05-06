'use client'

// Loads the Google Maps JS API exactly once for the entire app.
// Using useJsApiLoader here (rather than LoadScript) avoids blocking page
// rendering — LoadScript replaces children with a loading element until the
// script is ready, which would blank every page that doesn't need Maps.
// Components that need Maps consume the shared state via useGoogleMaps().

import { createContext, useContext, type ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-loader'

interface MapsState {
  isLoaded:  boolean
  loadError: Error | undefined
}

const MapsCtx = createContext<MapsState>({ isLoaded: false, loadError: undefined })

export function useGoogleMaps(): MapsState {
  return useContext(MapsCtx)
}

export default function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id:               GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries:        GOOGLE_MAPS_LIBRARIES,
    language:         'en',
    region:           'AU',
  })

  return (
    <MapsCtx.Provider value={{ isLoaded, loadError: loadError as Error | undefined }}>
      {children}
    </MapsCtx.Provider>
  )
}
