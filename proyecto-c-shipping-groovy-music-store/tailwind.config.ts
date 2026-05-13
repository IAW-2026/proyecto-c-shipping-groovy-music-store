import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4e5d66",
        secondary: "#728c94",
        border: "#cbd4d6",
        light: "#f0f4f5",
        background: "#e3e9ea",
      },
    },
  },
  plugins: [],
} satisfies Config;
