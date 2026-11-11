/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.14)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'glass-glow': '0 0 25px -5px var(--accent)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '40px',
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-delayed': 'float 14s ease-in-out 3s infinite',
        'float-reverse': 'float-reverse 16s ease-in-out 1s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-25px, 20px) scale(0.95)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-35px, 30px) scale(1.06)' },
          '66%': { transform: 'translate(25px, -35px) scale(0.92)' },
        },
      },
    },
  },
  plugins: [],
}

