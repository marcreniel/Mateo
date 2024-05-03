import type { Config } from "tailwindcss";
const {nextui} = require("@nextui-org/react");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'harvest-gold': {
          '50': '#fdf9ef',
          '100': '#f9f0db',
          '200': '#f3dfb5',
          '300': '#e7bd6e',
          '400': '#e2a855',
          '500': '#db9034',
          '600': '#cd7829',
          '700': '#aa5e24',
          '800': '#884b24',
          '900': '#6e3f20',
          '950': '#3b1e0f',
      },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          default: "#db9034",
          primary: "#db9034",
          secondary: "#db9034",
        },
      },
      dark: {
        colors: {},
      },
    },
  }),],
};
export default config;
