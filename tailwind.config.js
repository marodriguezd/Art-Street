/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atelier: {
          950: '#08090d',
          900: '#0f1118',
          850: '#161924',
          800: '#1e2232',
          750: '#272d42',
          700: '#343c56',
          600: '#4c577a',
          500: '#6b79a5',
          400: '#9aa5c8',
          300: '#c5cde3',
          200: '#e4e8f3',
          100: '#f4f6fa',
        },
        studio: {
          carbon: '#050608',
          paper: '#f8f6f0',
          terracotta: '#d95338',
          gold: '#dfa837',
          ochre: '#c68a35',
          cadmium: '#f97316',
          ultramarine: '#2563eb',
          sepia: '#78350f',
          rawUmber: '#451a03',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'atelier-radial': 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.15), transparent 70%)',
        'spotlight-gold': 'radial-gradient(circle at 80% 20%, rgba(223, 168, 55, 0.12), transparent 60%)',
        'spotlight-terracotta': 'radial-gradient(circle at 10% 80%, rgba(217, 83, 56, 0.1), transparent 60%)',
      },
    },
  },
  plugins: [],
};
