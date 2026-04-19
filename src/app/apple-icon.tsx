import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
          gap: '4px',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: '72px',
            fontWeight: 800,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          VG
        </span>
        <span
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '22px',
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '2px',
          }}
        >
          AU
        </span>
      </div>
    ),
    { ...size }
  )
}
