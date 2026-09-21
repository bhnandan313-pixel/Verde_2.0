/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          50:  '#edfdf4',
          100: '#d3f9e3',
          200: '#aaf2cb',
          300: '#73e6aa',
          400: '#38d181',
          500: '#14b863',  // brand primary
          600: '#0a9950',
          700: '#097a41',
          800: '#0a6135',
          900: '#09502d',
          950: '#042d19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
