/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      sm: '0.9rem',
      base: '1.1rem',
      xl: '1.35rem',
      '2xl': '1.663rem',
      '3xl': '2.053rem',
      '4xl': '2.541rem',
      '5xl': '3.152rem'
    },
    extend: {
      colors: {
        'b-black': {
          100: '#0C1618',
          200: '#1f292b',
          300: '#343d3f',
          400: '#4b5354',
          500: '#62696a'
        },
        'b-white': {
          100: '#FAF9F9',
          200: '#f2f1f1',
          300: '#eae9e9',
          400: '#d9d9d9',
          500: '#bab9b9',
          600: '#7d7d7d'
        },
        'b-blue': {
          // 300 is main colour #086788
          100: '#92c7cb',
          200: '#84c0c4',
          300: '#75B9BE',
          400: '#65a0a5',
          500: '#55898c'
        },
        'b-green': {
          // 300 is main colour #8FBC8F
          100: '#85a567',
          200: '#779a53',
          300: '#698F3F',
          400: '#5a7c35',
          500: '#4c692c'
        },
        'b-orange': {
          // 300 is main colour #F0803C
          100: '#ff9577',
          200: '#fe8666',
          300: '#FC7753',
          400: '#db6747',
          500: '#bb573b'
        }
      }
    }
  },
  variants: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: []
};