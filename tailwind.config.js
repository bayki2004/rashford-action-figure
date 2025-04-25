/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./ActionFigureGenerator.jsx"
  ],
  safelist: [
    'bg-orange-50',
    'bg-yellow-50', // ✅ fix: safelist bg-yellow-50
    'text-orange-700',
    'border-orange-400',
    'hover:border-orange-500'
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: colors.orange[50],
          100: colors.orange[100],
          400: colors.orange[400],
          500: colors.orange[500],
          700: colors.orange[700],
        },
        yellow: {
          50: colors.yellow[50], // ✅ use official Tailwind yellow
          500: colors.yellow[500],
        },
        gray: {
          800: colors.gray[800],
        },
        white: colors.white,
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
