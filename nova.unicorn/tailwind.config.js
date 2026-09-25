/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#081827',
        primary100: '#1d4ed8'
      },
      screens: {
        '2xl-custom': '1836px', 
      },
    },
  },
  plugins: [],
}