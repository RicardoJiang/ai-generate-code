/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          bg: '#050103', // Deep black-pink
          pink: '#FF69B4',
          lightPink: '#FFB7C5',
        }
      }
    },
  },
  plugins: [],
}

