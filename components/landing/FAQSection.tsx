"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { ChevronRight } from "lucide-react";

export default function FAQSection() {
  const { t } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === "dark";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [1, 2, 3, 4, 5, 6];

  return (
    <div className="mb-12 pt-8">
      <h2
        className={`text-3xl font-bold mb-4 text-center ${
          isDark ? "text-white" : "text-theme-text"
        }`}>
        {t("dashboard.faqTitle")}
      </h2>
      <p
        className={`text-lg text-center mb-8 ${
          isDark ? "text-gray-300" : "text-theme-text-secondary"
        }`}>
        {t("dashboard.faqSubtitle")}
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqItems.map((num) => {
          const isOpen = openIndex === num;
          return (
            <div
              key={num}
              className={`rounded-lg border transition-all ${
                isDark
                  ? "bg-theme-card border-theme-border"
                  : "bg-theme-card border-theme-border"
              } ${isOpen ? "shadow-md" : "shadow-sm"}`}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : num)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-theme-primary-light/10 transition-colors rounded-lg">
                <span
                  className={`font-semibold text-lg ${
                    isDark ? "text-white" : "text-theme-text"
                  }`}>
                  {t(`dashboard.faqItems.q${num}` as any)}
                </span>
                <ChevronRight
                  className={`w-5 h-5 transition-transform flex-shrink-0 ${
                    isOpen ? "transform rotate-90" : ""
                  } ${
                    isDark ? "text-gray-400" : "text-theme-text-secondary"
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-4">
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-gray-300" : "text-theme-text-secondary"
                    }`}>
                    {t(`dashboard.faqItems.a${num}` as any)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

