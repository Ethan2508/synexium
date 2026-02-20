import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte Francilienne Energy
        primary: {
          DEFAULT: "#283084", // Bleu Francilienne
          dark: "#1e2460",
          light: "#3a4296",
        },
        // Familles produits
        solar: {
          green: "#7fb727",  // Vert solaire
          yellow: "#eea400", // Jaune solaire
        },
        heatpump: {
          red: "#e6332a",    // Rouge PAC
        },
        climate: {
          blue: "#009fe3",   // Bleu climatisation
        },
        // Base
        white: "#FFFFFF",
        black: "#000000",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        scroll: "scroll 30s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
