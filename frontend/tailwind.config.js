/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#14110d",
        cardBg: "#1a1612",
        cardBorder: "#2e2820",
        accentPurple: "#a855f7",
        accentIndigo: "#6366f1",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.4), 0 0 30px rgba(168, 85, 247, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.7), 0 0 50px rgba(168, 85, 247, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
