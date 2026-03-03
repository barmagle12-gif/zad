export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      animation: {
        'swing': 'swing 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s infinite',
      },
      keyframes: {
        swing: {
          '0%, 100%': { transform: 'rotate(-6deg)' },
          '50%': { transform: 'rotate(6deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.4))', transform: 'scale(1)' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.8))', transform: 'scale(1.05)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      }
    },
  },
  plugins: [],
}
