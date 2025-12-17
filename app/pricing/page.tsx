"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Check, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

export default function PricingPage() {
  const { t } = useLanguage();
  const { themeId } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const isDark = themeId === "dark";
  const [isYearly, setIsYearly] = useState(false);

  const price = isYearly ? t("pricing.priceYearly") : t("pricing.priceMonthly");
  const period = isYearly ? t("pricing.perYear") : t("pricing.perMonth");
  const trialNote = isYearly
    ? t("pricing.trialNoteYearly")
    : t("pricing.trialNote");
  const savings = isYearly ? "€98.80" : ""; // 49.90 * 12 - 500 = 598.80 - 500 = 98.80

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--theme-background)" }}>
      {/* Navbar */}
      <nav className="bg-theme-card/80 backdrop-blur-sm border-b border-theme-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-theme-text">
                MediFlow
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-text transition-colors">
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-lg transition-colors text-sm font-medium">
                    {t("auth.register")}
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-lg transition-colors text-sm font-medium">
                  {t("dashboard.title")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16 pb-12 text-center px-4">
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? "text-white" : "text-theme-text"
          }`}>
          {t("pricing.title")}
        </h1>
        <p className="text-xl text-theme-text-secondary max-w-2xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div
          className={`flex items-center gap-4 p-1 rounded-lg ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-100 border border-gray-200"
          }`}>
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              !isYearly
                ? "bg-theme-primary text-white shadow-md"
                : isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}>
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
              isYearly
                ? "bg-theme-primary text-white shadow-md"
                : isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}>
            {t("pricing.yearly")}
            {isYearly && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {t("pricing.save")} {savings}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex justify-center">
          <div
            className={`relative w-full max-w-lg rounded-2xl border-2 p-8 shadow-xl transition-all ${
              isDark
                ? "bg-theme-card border-theme-primary/50"
                : "bg-theme-card border-theme-primary/30"
            }`}>
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-theme-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                {t("pricing.mostPopular")}
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-theme-text"
                }`}>
                {t("pricing.proPlan")}
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span
                  className={`text-5xl font-bold ${
                    isDark ? "text-theme-primary" : "text-theme-primary"
                  }`}>
                  {price}
                </span>
                <span className="text-lg text-theme-text-secondary">
                  {period}
                </span>
              </div>
              {isYearly && (
                <div className="mb-2">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                    {t("pricing.priceMonthly")} × 12 ={" "}
                    {isYearly ? "€598.80" : ""}
                  </span>
                </div>
              )}
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                  isDark
                    ? "bg-green-900/30 text-green-400"
                    : "bg-green-100 text-green-800"
                }`}>
                {t("pricing.trial")}
              </div>
              <p className="text-sm text-theme-text-secondary">{trialNote}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "unlimited",
                "aiAnalysis",
                "soap",
                "documents",
                "voice",
                "support",
                "security",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isDark
                        ? "bg-green-900/30"
                        : "bg-green-100"
                    }`}>
                    <Check
                      className={`w-4 h-4 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <span className={isDark ? "text-gray-200" : "text-theme-text"}>
                    {t(`pricing.features.${feature}` as any)}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full py-4 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-xl text-center font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
              {t("pricing.getStarted")}
              <ArrowRight className="w-5 h-5 inline-block ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
