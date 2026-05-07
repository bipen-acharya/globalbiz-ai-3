import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out both',
        'fade-in':    'fadeIn 0.5s ease-out both',
        'float':      'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'score-fill': 'scoreFill 1.2s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(37, 99, 235, 0)' },
        },
        scoreFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
