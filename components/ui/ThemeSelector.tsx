"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { themes, ThemeId } from "@/lib/themes";
import { useLanguage } from "@/lib/LanguageContext";

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { themeId, setTheme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text">
            {t("settings.theme")}
          </h2>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(themes) as ThemeId[]).map((id) => {
              const theme = themes[id];
              const isSelected = themeId === id;

              return (
                <button
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    onClose();
                  }}
                  className={`relative p-6 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? "border-theme-primary bg-theme-primary-light"
                      : "border-theme-border bg-theme-card hover:border-theme-primary"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 6 Color Preview */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.success }}
                      title="Success"
                    />
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.warning }}
                      title="Warning"
                    />
                    <div
                      className="h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: theme.colors.danger }}
                      title="Danger"
                    />
                  </div>

                  {/* Theme Info */}
                  <h3 className="font-semibold text-theme-text mb-1 text-lg">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-theme-text-secondary">{theme.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

