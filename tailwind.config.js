/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#070b14',
        },
        artist: {
          primary: '#f97316',   // warm studio orange
          secondary: '#8b5cf6', // creative violet
          accent: '#06b6d4',    // vibrant cyan
          success: '#10b981',   // completion emerald
          gold: '#f59e0b',      // graduation gold
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Calistoga', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
