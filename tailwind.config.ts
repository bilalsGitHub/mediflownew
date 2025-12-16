import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel ve sade renk paleti (doktor odaklı, göz yormayan)
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme colors - dynamically set by ThemeContext
        "theme-bg": "var(--theme-background)",
        "theme-primary": "var(--theme-primary)",
        "theme-primary-light": "var(--theme-primary-light)",
        "theme-primary-dark": "var(--theme-primary-dark)",
        "theme-text": "var(--theme-text-dark)",
        "theme-text-secondary": "var(--theme-text-secondary)",
        "theme-accent": "var(--theme-accent)",
        "theme-accent-light": "var(--theme-accent-light)",
        "theme-danger": "var(--theme-danger)",
        "theme-card": "var(--theme-card-bg)",
        "theme-border": "var(--theme-border)",
        "theme-success": "var(--theme-success)",
        "theme-success-light": "var(--theme-success-light)",
        "theme-warning": "var(--theme-warning)",
        "theme-warning-light": "var(--theme-warning-light)",
        "theme-info": "var(--theme-info)",
        "theme-info-light": "var(--theme-info-light)",
        "theme-neutral": "var(--theme-neutral)",
        "theme-gray-bg": "var(--theme-gray-bg)",
        "theme-gray-card": "var(--theme-gray-card)",
        "theme-gray-border": "var(--theme-gray-border)",
      },
    },
  },
  plugins: [],
};
export default config;

