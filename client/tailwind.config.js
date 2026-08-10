/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4648d4",
          hover: "#393ab3",
          light: "#e1e0ff",
          container: "#6063ee",
        },
        secondary: {
          DEFAULT: "#006c49",
          hover: "#005438",
          light: "#e6f9f1",
          container: "#6ffbbe",
        },
        surface: {
          DEFAULT: "#ffffff",
          background: "#f8f9ff",
          low: "#eff4ff",
          container: "#e5eeff",
          highest: "#d3e4fe",
          border: "#d3e4fe",
        },
        on: {
          surface: "#0b1c30",
          variant: "#464554",
          muted: "#767586",
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 28, 48, 0.05)',
        'card': '0 2px 12px 0 rgba(70, 72, 212, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(70, 72, 212, 0.12)',
      }
    },
  },
  plugins: [],
}
