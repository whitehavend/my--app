/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        primary100: '#1f1f1f'
      },
      screens: {
        '2xl-custom': '1836px', 
      },
    },
  },
  plugins: [],
}