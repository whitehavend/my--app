/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10231f",
        moss: "#2d6a4f",
        lime: "#b6d92f",
        paper: "#f3f5ed",
        coral: "#ed6a5a",
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans: ["Manrope", "Arial", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 60px rgba(16, 35, 31, 0.12)",
      },
    },
  },
  plugins: [],
};
