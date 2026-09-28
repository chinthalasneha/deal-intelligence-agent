/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        bgCard: "var(--bg-card)",
        bgCardHover: "var(--bg-card-hover)",
        borderPrimary: "var(--border-primary)",
        borderSecondary: "var(--border-secondary)",
        colorPrimary: "var(--color-primary)",
        colorCream: "var(--color-cream)",
        colorGreenLight: "var(--color-green-light)",
        colorGreenMuted: "var(--color-green-muted)",
        colorCreamDark: "var(--color-cream-dark)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        statusDanger: "var(--status-danger)",
        statusWarning: "var(--status-warning)",
        statusSuccess: "var(--status-success)",
        statusInfo: "var(--status-info)",
        buttonPrimary: "var(--button-primary)",
        buttonPrimaryText: "var(--button-primary-text)",
        hoverPrimary: "var(--hover-primary)",
        // Aliases for compatibility
        cream: "var(--color-cream)",
        purple: "var(--color-cream)",
        pink: "var(--color-green-light)",
        burgundy: "var(--bg-secondary)",
        darkBg: "var(--bg-primary)",
        cardBg: "var(--bg-card)",
        cardBorder: "var(--border-primary)",
        accentPurple: "var(--color-cream)",
        accentIndigo: "var(--color-cream)",
        creamYellow: "var(--color-cream)",
        softPink: "var(--color-green-light)",
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
          '0%, 100%': { boxShadow: '0 0 15px rgba(247, 244, 201, 0.3), 0 0 30px rgba(168, 201, 184, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(247, 244, 201, 0.5), 0 0 50px rgba(168, 201, 184, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
