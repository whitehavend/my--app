/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#02070d',
        primary100: '#0d131b',
        secondary: '#111b26',
        surface: '#101822',
        accent: '#7ce6d4',
        accentSoft: '#a7f3d0',
        text: '#f3f5f7',
        muted: '#9aa5b1',
        border: 'rgba(255,255,255,0.09)',
      },
      screens: {
        '2xl-custom': '1836px',
      },
    },
  },
  plugins: [],
}