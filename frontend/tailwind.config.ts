import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Palette terrosa personalizzata
        earth: {
          teal: "#1a4d4d",      // GREEN TEAL - per carico
          sage: "#7a9b9b",      // SAGE - per info/riepilogo
          terracotta: "#c86428", // TERRACOTTA - per scarico
          brick: "#b83c2f",     // BRICK - per errori
          taupe: "#c9b5a0",     // TAUPE - per neutri
          "taupe-light": "#e8ddd0",
          "taupe-dark": "#6b5d4f",
        },
        // Colori specifici per tipi di vino
        wine: {
          white: "#d4c78a",     // Bianco - giallo paglierino più spento
          rose: "#d89ba8",      // Rosato - rosa salmone più tenue
          red: "#7B0F1E",       // Rosso - rosso rubino
          sparkling: "#e6dfa8", // Spumante - oro pallido più spento
          sweet: "#b8873d",     // Passito/Dolce - ambrato più scuro
          fortified: "#9d5a2e", // Fortificato - mogano più terroso
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
