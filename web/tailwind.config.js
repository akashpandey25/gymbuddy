/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#00E87A",
          dark: "#0D0D0F",
          card: "#161618",
          border: "#2A2A2E",
          muted: "#6B7280",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [],
}
