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
      <p className="text-sm rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(226,107,107,0.4)', background: 'rgba(226,107,107,0.08)', color: 'var(--danger)' }}>
        Failed to load Google Maps address search. Check your API key.
      </p>
    )
  }

  if (!isLoaded) {
    return <input className={`input opacity-60 ${className ?? ''}`} placeholder="Loading address search…" disabled />
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
          className={`input ${className ?? ''}`}
          placeholder="Start typing your business address or suburb…"
          defaultValue={selected?.formattedAddress ?? ''}
          onChange={() => {
            if (selected) onClear()
          }}
        />
      </Autocomplete>

      {selected && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(109,191,138,0.3)', background: 'rgba(109,191,138,0.06)' }}>
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--ok)' }} />
          <div className="text-xs">
            <p className="font-medium" style={{ color: 'var(--paper)' }}>{selected.formattedAddress}</p>
            <p className="mt-0.5" style={{ color: 'var(--paper-3)' }}>
              {[selected.suburb, selected.state, selected.postcode].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
