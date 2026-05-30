/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"IBM Plex Sans\"", "ui-sans-serif", "system-ui"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular"],
      },
    },
  },
  plugins: [],
}
