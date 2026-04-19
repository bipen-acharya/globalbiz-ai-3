import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        {/* "VG" lettering — clean, readable at 32px */}
        <span
          style={{
            color: 'white',
            fontSize: '15px',
            fontWeight: 800,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}
        >
          VG
        </span>
      </div>
    ),
    { ...size }
  )
}
