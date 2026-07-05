/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TravelCFO Design System
        warm: {
          bg:    '#FAFAF7', // primary background — warm off-white
          card:  '#FFFFFF', // card surface
        },
        ink: {
          DEFAULT: '#1A1A1A', // primary text — warmer than pure slate
          muted:   '#6B7280', // secondary text
          faint:   '#9CA3AF', // placeholders, labels
        },
        accent: {
          DEFAULT: '#E8A317', // amber — finance/premium anchor
          hover:   '#D4920F',
        },
        border: {
          DEFAULT: '#E5E7EB',
        },
        money: {
          green: '#16A34A',
          red:   '#DC2626',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 8s infinite',
      },
    },
  },
  plugins: [],
}