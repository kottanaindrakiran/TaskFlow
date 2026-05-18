/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F0F",
        sidebar: "#111111",
        card: "#1A1A1A",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
        },
        border: "#2A2A2A",
        text: {
          primary: "#FFFFFF",
          secondary: "#AAAAAA",
          muted: "#666666",
        }
      },
    },
  },
  plugins: [],
}
