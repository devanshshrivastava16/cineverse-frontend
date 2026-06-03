/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e50914',
        secondary: '#1a1a2e',
        dark: '#0f3460',
        darker: '#16213e',
      },
    },
  },
  plugins: [],
}
