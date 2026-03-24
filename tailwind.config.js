/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#fb51fb",
        "on-primary-fixed": "#000000",
        "secondary": "#83fc8e",
        "tertiary": "#ffd16c",
        "surface": "#0e0e10",
        "surface-container-low": "#131315",
        "surface-container-high": "#1f1f22",
        "on-surface": "#f9f5f8",
        "on-surface-variant": "#adaaad",
        "error": "#ff6e84",
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["Roboto Mono", "monospace"]
      },
    },
  },
  plugins: [],
}