/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.2)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.2)' },
          '60%': { transform: 'scale(1)' },
        }
      },
      animation: {
        'lub-dub': 'heartbeat 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
