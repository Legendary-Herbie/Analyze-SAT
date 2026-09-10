/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#1a2636',
          800: '#243955',
          700: '#2c4160',
          600: '#3a5373',
          500: '#405978',
          400: '#5c7696',
          100: '#eef2f7',
          50: '#f6f8fb',
        },
        sat: {
          green: '#18745a',
          emerald: '#10b981',
          red: '#ad4949',
          rose: '#f43f5e',
          amber: '#d97706',
          blue: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 12px 32px rgba(25, 37, 56, 0.055)',
        'hero': '0 20px 40px rgba(26, 38, 54, 0.12)',
        'modal': '0 26px 90px rgba(0, 0, 0, 0.22)',
      }
    },
  },
  plugins: [],
}
