/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // TravelCFO New-Gen Travel Fintech Design System
        warm: {
          bg: '#F7F8FA',
          paper: '#FAF7F2',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1E293B',
          strong: '#0F172A',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        accent: {
          DEFAULT: '#FF6B35',
          hover: '#E8553D',
          pressed: '#CF442A',
        },
        border: {
          DEFAULT: 'rgba(15, 23, 42, 0.08)',
        },
        money: {
          green: '#059669',
          red: '#DC2626',
        },
        trust: {
          navy: '#172033',
          slate: '#1E293B',
        },
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 25px -5px rgba(15, 23, 42, 0.12), 0 3px 8px rgba(15, 23, 42, 0.06)',
        wallet: '0 20px 45px -24px rgba(15, 23, 42, 0.55)',
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
};
