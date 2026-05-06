'use client'

import { useCallback, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Autocomplete } from '@react-google-maps/api'
import { useGoogleMaps } from '@/components/GoogleMapsProvider'

export interface PlaceResult {
  formattedAddress: string
  suburb:           string
  state:            string
  postcode:         string
  lat:              number
  lng:              number
}

interface AddressPickerProps {
  onSelect:  (p: PlaceResult) => void
  onClear:   () => void
  selected:  PlaceResult | null
  error?:    string
  className?: string
}

export function AddressPicker({ onSelect, onClear, selected, error, className }: AddressPickerProps) {
  const { isLoaded, loadError } = useGoogleMaps()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ac, setAc] = useState<any>(null)

  const onLoad = useCallback((instance: unknown) => setAc(instance), [])

  const onPlaceChanged = useCallback(() => {
    if (!ac) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const place: any = ac.getPlace()
    if (!place?.geometry?.location || !place?.address_components) return

    const comps: Array<{ types: string[]; long_name: string; short_name: string }> =
      place.address_components

    const get = (type: string, nameType: 'long_name' | 'short_name' = 'long_name') =>
      comps.find(c => c.types.includes(type))?.[nameType] ?? ''

    const suburb =
      get('locality') ||
      get('sublocality_level_1') ||
      get('sublocality') ||
      get('neighborhood') ||
      get('administrative_area_level_2')

    onSelect({
      formattedAddress: place.formatted_address ?? '',
      suburb,
      state:    get('administrative_area_level_1', 'short_name'),
      postcode: get('postal_code'),
      lat:      place.geometry.location.lat(),
      lng:      place.geometry.location.lng(),
    })
  }, [ac, onSelect])

  if (loadError) {
    return (
      <p className="text-sm text-red-500 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        Failed to load Google Maps address search. Check your API key.
      </p>
    )
  }

  if (!isLoaded) {
    return <input className={`form-input opacity-60 ${className ?? ''}`} placeholder="Loading address search…" disabled />
  }

  return (
    <>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          componentRestrictions: { country: 'au' },
          fields: ['address_components', 'formatted_address', 'geometry'],
        }}
      >
        <input
          type="text"
          className={`form-input ${error ? 'border-red-300 focus:border-red-400 focus:shadow-none' : ''} ${className ?? ''}`}
          placeholder="Start typing your business address or suburb…"
          defaultValue={selected?.formattedAddress ?? ''}
          onChange={() => {
            if (selected) onClear()
          }}
        />
      </Autocomplete>

      {error && !selected && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {selected && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-emerald-900">{selected.formattedAddress}</p>
            <p className="mt-0.5 text-emerald-600">
              {[selected.suburb, selected.state, selected.postcode].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
