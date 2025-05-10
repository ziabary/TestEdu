/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['IRANSansX', 'sans-serif'],
        'persian': ['IRANSansX', 'sans-serif'],
      },
      colors: {
        secondary: '#4f46e5', // You can change this to your desired secondary color
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}