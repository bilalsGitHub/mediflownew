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
        /* ========================================
           6 BASE COLORS × 6 THEMES = 36 TOTAL
           Dynamically set by ThemeContext
           ======================================== */
        
        // Base Layout
        "theme-background": "var(--theme-background)",
        "theme-text": "var(--theme-text)",
        "theme-text-secondary": "var(--theme-text-secondary)",
        "theme-card": "var(--theme-card)",
        "theme-border": "var(--theme-border)",
        
        // 1. PRIMARY - Main Actions
        "theme-primary": "var(--theme-primary)",
        "theme-primary-hover": "var(--theme-primary-hover)",
        "theme-primary-light": "var(--theme-primary-light)",
        
        // 2. SECONDARY - AI/Premium
        "theme-secondary": "var(--theme-secondary)",
        "theme-secondary-hover": "var(--theme-secondary-hover)",
        "theme-secondary-light": "var(--theme-secondary-light)",
        
        // 3. ACCENT - Highlights
        "theme-accent": "var(--theme-accent)",
        "theme-accent-hover": "var(--theme-accent-hover)",
        "theme-accent-light": "var(--theme-accent-light)",
        
        // 4. SUCCESS - Success States
        "theme-success": "var(--theme-success)",
        "theme-success-hover": "var(--theme-success-hover)",
        "theme-success-light": "var(--theme-success-light)",
        
        // 5. WARNING - Warning States
        "theme-warning": "var(--theme-warning)",
        "theme-warning-hover": "var(--theme-warning-hover)",
        "theme-warning-light": "var(--theme-warning-light)",
        
        // 6. DANGER - Danger Actions
        "theme-danger": "var(--theme-danger)",
        "theme-danger-hover": "var(--theme-danger-hover)",
        "theme-danger-light": "var(--theme-danger-light)",
        
        // Neutral
        "theme-neutral": "var(--theme-neutral)",
        "theme-neutral-hover": "var(--theme-neutral-hover)",
        
        // Legacy Compatibility (Deprecated)
        "theme-primary-dark": "var(--theme-primary-hover)",
        "theme-gray-bg": "var(--theme-card)",
      },
    },
  },
  plugins: [],
};
export default config;

