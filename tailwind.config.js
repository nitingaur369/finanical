/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#070B14',
          900: '#0B0F19', // Primary background
          850: '#101726', // Elevated background
          800: '#151E32', // Secondary surfaces / cards
          750: '#1C2740', // Hover surface
          700: '#253554', // Border soft
          600: '#33476E',
          500: '#48639C',
        },
        brand: {
          teal: '#14B8A6',
          emerald: '#10B981',
          sky: '#38BDF8',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
