/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c1f3d',
        navy: '#0b213a',
        primary: '#0877ed',
      },
      boxShadow: {
        card: '0 5px 20px rgba(33, 72, 121, 0.055)',
      },
    },
  },
  plugins: [],
}
