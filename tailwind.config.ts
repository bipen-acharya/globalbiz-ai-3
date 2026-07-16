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
        // ink scale — cream canvas, white cards
        ink: {
          0: '#F7F6F0',
          1: '#FFFFFF',
          2: '#FFFFFF',
          3: '#EFEEE6',
          4: '#E8E6DB',
        },
        // paper — deep navy text
        paper: {
          DEFAULT: '#1B2559',
          2: '#414A6E',
          3: '#636A87',
          4: '#9BA0B6',
        },
        // accent — royal blue action
        gold: {
          DEFAULT: '#3448B0',
          2: '#4557C7',
        },
        // brand green — highlights, eyebrows, ticks
        green: {
          DEFAULT: '#17976C',
          2: '#12805B',
          soft: '#DFF2EA',
        },
        line: 'rgba(27,37,89,0.08)',
        'line-2': 'rgba(27,37,89,0.13)',
        'line-3': 'rgba(27,37,89,0.22)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27, 37, 89, 0.05)',
        elevated: '0 4px 16px rgba(27, 37, 89, 0.07)',
        floating: '0 16px 48px -12px rgba(27, 37, 89, 0.12)',
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
