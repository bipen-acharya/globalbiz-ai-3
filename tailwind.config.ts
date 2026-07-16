import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-body)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'monospace'],
      },
      colors: {
        // ink scale (was dark; now light surfaces)
        ink: {
          0: '#FFFFFF',
          1: '#FAFAF7',
          2: '#FFFFFF',
          3: '#F4F4F1',
          4: '#ECECE6',
        },
        // paper (was off-white; now dark text)
        paper: {
          DEFAULT: '#0A0A0A',
          2: '#3A3A3A',
          3: '#6B6B6B',
          4: '#9A9A9A',
        },
        // accent — indigo (was gold)
        gold: {
          DEFAULT: '#4F46E5',
          2: '#6366F1',
        },
        line: 'rgba(15,15,15,0.06)',
        'line-2': 'rgba(15,15,15,0.10)',
        'line-3': 'rgba(15,15,15,0.18)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 15, 15, 0.04)',
        elevated: '0 4px 16px rgba(15, 15, 15, 0.06)',
        floating: '0 16px 48px -12px rgba(15, 15, 15, 0.10)',
      },
      animation: {
        'fade-up':  'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':  'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'drift':    'drift 5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
