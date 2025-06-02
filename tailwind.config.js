/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        nunito: ['"Nunito"', 'sans-serif'],
      },
      fontSize: {
        title: "111px",
        login: "56px",
        base40: "40px"
      }
    },
  },
  plugins: [],
};

