/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Outfit', 'sans-serif'],
        sans: ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        sticker: '6px 6px 0 #171321',
        candy: '0 24px 70px rgba(255, 93, 171, 0.28)',
        mint: '0 20px 60px rgba(91, 225, 191, 0.24)',
      },
      colors: {
        bubblegum: '#ff5dab',
        sunshine: '#ffdf43',
        minty: '#5be1bf',
        ink: '#171321',
        blush: '#fff3fb',
      },
    },
  },
  plugins: [],
}
