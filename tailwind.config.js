/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
          soft: "#EFF4FF",
        },
        graphite: "#1F2937",
        canvas: "#F6F8FB",
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)",
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};
