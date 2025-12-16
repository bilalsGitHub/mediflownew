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
    // Validate saved theme - if it's not 'light' or 'dark', use default
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
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
    
    root.style.setProperty("--theme-background", theme.colors.background);
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-primary-light", theme.colors.primaryLight);
    root.style.setProperty("--theme-primary-dark", theme.colors.primaryDark);
    root.style.setProperty("--theme-text-dark", theme.colors.textDark);
    root.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-accent-light", theme.colors.accentLight || theme.colors.primaryLight);
    root.style.setProperty("--theme-danger", theme.colors.danger);
    root.style.setProperty("--theme-card-bg", theme.colors.cardBg || theme.colors.background);
    root.style.setProperty("--theme-border", theme.colors.border || "#E5E7EB");
    root.style.setProperty("--theme-success", theme.colors.success || theme.colors.accent);
    root.style.setProperty("--theme-success-light", theme.colors.successLight || theme.colors.accentLight);
    root.style.setProperty("--theme-warning", theme.colors.warning || "#F59E0B");
    root.style.setProperty("--theme-warning-light", theme.colors.warningLight || "#FEF3C7");
    root.style.setProperty("--theme-info", theme.colors.info || theme.colors.primary);
    root.style.setProperty("--theme-info-light", theme.colors.infoLight || theme.colors.primaryLight);
    root.style.setProperty("--theme-neutral", theme.colors.neutral || theme.colors.textSecondary);
    root.style.setProperty("--theme-gray-bg", theme.colors.grayBg || theme.colors.background);
    root.style.setProperty("--theme-gray-card", theme.colors.grayCard || theme.colors.cardBg);
    root.style.setProperty("--theme-gray-border", theme.colors.grayBorder || theme.colors.border);
    
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

