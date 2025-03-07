
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html","./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGold: '#c1aa7F',
        customGrayDark: '#393732',
        customGrayDarker: '#24282B',
      },
    },
  },
  plugins: [],
}



