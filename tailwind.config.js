/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        lime: {
          DEFAULT: "#d7ff36",
          dark: "#b5d72e",
        },
        brandRed: "#a83b2e",
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.06em',
        tight: '-0.03em',
        widest: '0.2em',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-12deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-10deg)' },
        }
      },
      animation: {
        ticker: 'ticker 15s linear infinite',
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
