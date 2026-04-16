const PLACEHOLDER_KEYS = new Set(['YOUR_KEY', 'AIza...', '', undefined])

function resolveKey(raw: string | undefined): string {
  if (!raw || PLACEHOLDER_KEYS.has(raw) || raw.startsWith('YOUR_')) return ''
  return raw
}

export const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = resolveKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
export const GOOGLE_MAPS_API_KEY = resolveKey(process.env.GOOGLE_MAPS_API_KEY)

if (process.env.NODE_ENV === 'development') {
  if (!NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.warn(
      '[env] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing or a placeholder.\n' +
      '  → Add a real key to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...\n' +
      '  → Enable: Maps JavaScript API + Places API\n' +
      '  → Add localhost:3000 to allowed referrers (or remove restrictions for dev)'
    )
  }
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn(
      '[env] GOOGLE_MAPS_API_KEY is missing or a placeholder.\n' +
      '  → Add a real key to .env.local: GOOGLE_MAPS_API_KEY=AIzaSy...\n' +
      '  → Enable: Places API + Geocoding API\n' +
      '  → Add your server IP (or remove restrictions for dev)'
    )
  }
}
