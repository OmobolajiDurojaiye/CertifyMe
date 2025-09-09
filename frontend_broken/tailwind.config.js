/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#FACC15",
        background: "#F9FAFB",
        slate: {
          DEFAULT: "#1E293B",
          900: "#0f172a",
          500: "#64748b",
          400: "#94a3b8",
        },
        accent: "#22C55E",
      },
    },
  },
  plugins: [],
};
