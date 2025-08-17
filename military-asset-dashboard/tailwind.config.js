/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd28d',
          400: '#5ab85a',
          500: '#369836',
          600: '#2a7c2a',
          700: '#246324',
          800: '#1f4f1f',
          900: '#1a421a',
        },
        status: {
          available: '#10b981',
          repair: '#f59e0b',
          expended: '#ef4444',
        }
      },
      fontFamily: {
        'military': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}