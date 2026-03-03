/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Here is where you can add your Figma brand colors!
        'brand-purple': '#a855f7',
      },
    },
  },
  plugins: [],
}
