/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
      require('./node_modules/hollyburn-lib/tailwind.config')
  ],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/hollyburn-lib/src/components/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'hbOrange': '#F4C82D',
        'hbOrangeHover': '#e2b30c',
        'hbGray': '#464646',
        'hbLightGray': '#f5f5f5',
        'footerBorder': '#c8c6c5',
        'fontGray': "#868686",
        'hbBlue': '#003976'
      },
      minHeight: {
        '1/2':'50%',
        '1/4':'25%',
      },
      maxHeight: {
        '1/2': '50%',
        '1/4': '25%'
      },
      backgroundImage: {
        'bookingBanner': 'url(/images/booking-banner.jpg)',
        'manageBanner':'url(/images/manage-banner.jpg)'
      }
    },
  },
  plugins: [],
}
