"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeId, themes, defaultTheme } from "./themes";

interface ThemeContextType {
  themeId: ThemeId;
  theme: typeof themes[ThemeId];
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeId | null;
    const validThemes: ThemeId[] = ['light', 'dark', 'medical', 'premium', 'ocean', 'forest'];
    
    // Validate saved theme
    if (savedTheme && validThemes.includes(savedTheme)) {
      setThemeIdState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Reset to default if invalid theme
      localStorage.setItem("theme", defaultTheme);
      setThemeIdState(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  // Apply theme to CSS variables
  const applyTheme = (id: ThemeId) => {
    const theme = themes[id];
    const root = document.documentElement;
    
    // Base colors
    root.style.setProperty("--theme-background", theme.colors.background);
    root.style.setProperty("--theme-text", theme.colors.text);
    root.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
    root.style.setProperty("--theme-card", theme.colors.card);
    root.style.setProperty("--theme-border", theme.colors.border);
    
    // Primary (Main actions)
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-primary-hover", theme.colors.primaryHover);
    root.style.setProperty("--theme-primary-light", theme.colors.primaryLight);
    
    // Secondary (AI/Premium)
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-secondary-hover", theme.colors.secondaryHover);
    root.style.setProperty("--theme-secondary-light", theme.colors.secondaryLight);
    
    // Accent
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-accent-hover", theme.colors.accentHover);
    root.style.setProperty("--theme-accent-light", theme.colors.accentLight);
    
    // Success
    root.style.setProperty("--theme-success", theme.colors.success);
    root.style.setProperty("--theme-success-hover", theme.colors.successHover);
    root.style.setProperty("--theme-success-light", theme.colors.successLight);
    
    // Warning
    root.style.setProperty("--theme-warning", theme.colors.warning);
    root.style.setProperty("--theme-warning-hover", theme.colors.warningHover);
    root.style.setProperty("--theme-warning-light", theme.colors.warningLight);
    
    // Danger
    root.style.setProperty("--theme-danger", theme.colors.danger);
    root.style.setProperty("--theme-danger-hover", theme.colors.dangerHover);
    root.style.setProperty("--theme-danger-light", theme.colors.dangerLight);
    
    // Neutral
    root.style.setProperty("--theme-neutral", theme.colors.neutral);
    root.style.setProperty("--theme-neutral-hover", theme.colors.neutralHover);
    
    // Legacy compatibility (deprecated but kept for backward compatibility)
    root.style.setProperty("--theme-primary-dark", theme.colors.primaryHover);
    root.style.setProperty("--theme-accent-light", theme.colors.accentLight);
    root.style.setProperty("--theme-card-bg", theme.colors.card);
    root.style.setProperty("--theme-gray-bg", theme.colors.card);
    
    // Also set body background
    document.body.style.backgroundColor = theme.colors.background;
  };

  const setTheme = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem("theme", id);
    applyTheme(id);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme: themes[themeId],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

