/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: { DEFAULT: '#070709', 900: '#070709', 800: '#0b0c10', 700: '#12131a' },
        neon: { blue: '#00F0FF', purple: '#9333EA' },
        wa: { DEFAULT: '#25D366', dark: '#128C7E' },
      },
      fontFamily: {
        sans: ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
        display: ['Rubik', 'Heebo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(0,240,255,.45), 0 0 64px rgba(0,240,255,.15)',
        'glow-purple': '0 0 24px rgba(147,51,234,.5), 0 0 64px rgba(147,51,234,.18)',
        'glow-wa': '0 0 20px rgba(37,211,102,.6), 0 0 60px rgba(37,211,102,.25)',
      },
      keyframes: {
        'wa-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(37,211,102,.65)' },
          '70%': { boxShadow: '0 0 0 22px rgba(37,211,102,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0)' },
        },
        wave: { '0%,100%': { transform: 'scaleY(.35)' }, '50%': { transform: 'scaleY(1)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(50%)' } },
        shimmer: { from: { backgroundPosition: '0% 50%' }, to: { backgroundPosition: '200% 50%' } },
      },
      animation: {
        'wa-pulse': 'wa-pulse 2s cubic-bezier(.4,0,.6,1) infinite',
        wave: 'wave 1.1s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
