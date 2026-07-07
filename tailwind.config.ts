import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf6f0",
        ink: "#1f1b16",
        clay: "#b0653f",
        clayDeep: "#7e3419",
        sand: "#e7ddd0",
        muted: "#5c5347",
        good: "#3d7a4f",
        bad: "#a33a2e",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
