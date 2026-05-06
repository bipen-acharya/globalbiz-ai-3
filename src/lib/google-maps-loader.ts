import type { Libraries } from '@react-google-maps/api'

// Single source of truth — both loader calls must use these exact values.
// Using different IDs or different libraries in separate useJsApiLoader calls
// throws "Loader must not be called again with different options".
export const GOOGLE_MAPS_LOADER_ID = 'globalbiz-maps-global'
export const GOOGLE_MAPS_LIBRARIES: Libraries = ['places']
