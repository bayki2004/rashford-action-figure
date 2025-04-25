/** @type {import('tailwindcss').Config} */

const { orange, gray, white, yellow } = require('tailwindcss/colors');

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./ActionFigureGenerator.jsx"
  ],
  safelist: [
    'bg-orange-50',
    'bg-yellow-50',
    'text-orange-700',
    'border-orange-400',
    'hover:border-orange-500'
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: orange[50],
          100: orange[100],
          400: orange[400],
          500: orange[500],
          700: orange[700],
        },
        gray: {
          800: gray[800],
        },
        yellow: {
          50: "#FFFBEA", // Light yellowish background
          500: yellow[500],
        },
        white: white,
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'], // Add a nice font like Poppins
      },
    },
  },
  plugins: [],
}
