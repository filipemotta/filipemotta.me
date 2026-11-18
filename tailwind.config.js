/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "'SF Mono'", "monospace"],
      },
      colors: {
        ink: "#06080C",
        surface: "#0B0F15",
        raised: "#10151D",
        accent: "#2E9BFF",
        signal: "#5EE0CF",
        muted: "#8E99AB",
      },
    },
  },
  plugins: [],
};
