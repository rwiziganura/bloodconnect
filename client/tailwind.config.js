/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E63946",
        primaryDark: "#C1121F",
        primaryLight: "#FF6B6B",
        bgDark: "#0D0D0D",
        surfaceDark: "#1A1A1A",
        cardDark: "#242424",
        bgLight: "#FAFAFA",
        surfaceLight: "#FFFFFF",
        cardLight: "#F1F1F1",
        accentGold: "#FFD60A",
        success: "#2DC653",
        warning: "#FF9F1C",
        textLight: "#1A1A1A",
        textDark: "#F5F5F5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-red": "0 0 24px rgba(230, 57, 70, 0.35)",
        "glow-red-lg": "0 0 40px rgba(230, 57, 70, 0.45)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.12)",
        "glass-dark": "0 8px 32px rgba(230, 57, 70, 0.08)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.02)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(230, 57, 70, 0.6)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 36px rgba(230, 57, 70, 0.9)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        "drop-fall": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(400px)", opacity: "0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "bounce-slow": "bounce 2s ease-in-out infinite",
        shake: "shake 0.45s ease-in-out",
        "drop-fall": "drop-fall 8s linear infinite",
        ticker: "ticker 40s linear infinite",
      },
      transitionDuration: {
        theme: "300ms",
      },
    },
  },
  plugins: [],
};
