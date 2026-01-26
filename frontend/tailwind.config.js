/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        policeRed: {
          light: "#fee2e2",
          DEFAULT: "#dc2626",
          dark: "#991b1b",
        },
      },
    },
  },
  plugins: [],
};
