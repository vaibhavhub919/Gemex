/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",
        ink: "#101828",
        sand: "#fff7ed",
        mist: "#f8fafc"
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};
