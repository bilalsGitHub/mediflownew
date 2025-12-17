"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import LanguageSelector from "@/components/LanguageSelector";
import FAQSection from "@/components/FAQSection";
import {
  ArrowRight,
  Mic,
  Sparkles,
  FileText,
  Clock,
  ClipboardList,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === "dark";
  const [hasRedirected, setHasRedirected] = useState(false);
  const [animatedMinutes, setAnimatedMinutes] = useState(0);
  const timeSavedRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (!isLoading && user && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, hasRedirected]);

  // Animate minutes counter with Intersection Observer
  useEffect(() => {
    if (!user && !isLoading && timeSavedRef.current && !hasAnimated.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              hasAnimated.current = true;

              const targetMinutes = 80;
              const duration = 1000; // 1 second
              const startTime = performance.now();

              // Ease-out cubic function for smooth animation
              const easeOutCubic = (t: number): number => {
                return 1 - Math.pow(1 - t, 3);
              };

              const animate = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutCubic(progress);
                const currentValue = Math.floor(easedProgress * targetMinutes);

                setAnimatedMinutes(currentValue);

                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  setAnimatedMinutes(targetMinutes);
                }
              };

              // Start animation
              requestAnimationFrame(animate);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px" }
      );

      observer.observe(timeSavedRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [user, isLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--theme-background)" }}>
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
              isDark ? "border-theme-primary" : "border-purple-600"
            }`}></div>
          <p className={isDark ? "text-white" : "text-theme-text-secondary"}>
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in, show nothing (will redirect)
  if (user) {
    return null;
  }

  // Landing page for non-logged-in users
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--theme-background)" }}>
      {/* Top Navbar */}
      <nav className="bg-theme-card/80 backdrop-blur-sm border-b border-theme-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-theme-text">MediFlow</h1>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-text transition-colors">
                {t("pricing.menuLabel")}
              </Link>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-theme-text mb-6">
            {t("dashboard.purpose")}
          </h1>
          <p className="text-xl text-theme-text-secondary mb-8 max-w-2xl mx-auto">
            {t("dashboard.purposeDescription")}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-lg text-lg font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
              {t("auth.register")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-theme-card hover:bg-theme-primary-light text-theme-text rounded-lg text-lg font-semibold shadow-lg border border-theme-border transition-all flex items-center gap-2">
              {t("auth.login")}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-theme-text mb-8 text-center">
            {t("dashboard.features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: t("dashboard.feature1Title"),
                description: t("dashboard.feature1Desc"),
                time: t("dashboard.feature1Time"),
                color: isDark
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-700",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: t("dashboard.feature2Title"),
                description: t("dashboard.feature2Desc"),
                time: t("dashboard.feature2Time"),
                color: isDark
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-100 text-green-700",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: t("dashboard.feature3Title"),
                description: t("dashboard.feature3Desc"),
                time: t("dashboard.feature3Time"),
                color: isDark
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-purple-100 text-purple-700",
              },
              {
                icon: <ClipboardList className="w-6 h-6" />,
                title: t("dashboard.feature4Title"),
                description: t("dashboard.feature4Desc"),
                time: t("dashboard.feature4Time"),
                color: isDark
                  ? "bg-gray-700/50 text-gray-300"
                  : "bg-gray-100 text-gray-700",
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: t("dashboard.feature5Title"),
                description: t("dashboard.feature5Desc"),
                time: t("dashboard.feature5Time"),
                color: isDark
                  ? "bg-gray-700/50 text-gray-300"
                  : "bg-gray-100 text-gray-700",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: t("dashboard.feature6Title"),
                description: t("dashboard.feature6Desc"),
                time: t("dashboard.feature6Time"),
                color: isDark
                  ? "bg-gray-700/50 text-gray-300"
                  : "bg-gray-100 text-gray-700",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow ${
                  isDark
                    ? "bg-theme-card border-theme-border"
                    : "bg-theme-card border-theme-border"
                }`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`${feature.color} p-3 rounded-lg flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-2 ${
                        isDark ? "text-white" : "text-theme-text"
                      }`}>
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm mb-3 ${
                        isDark ? "text-gray-300" : "text-theme-text-secondary"
                      }`}>
                      {feature.description}
                    </p>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        isDark ? "text-gray-400" : "text-theme-text-secondary"
                      }`}>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{feature.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved Summary */}
        <div
          ref={timeSavedRef}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center shadow-lg mb-16">
          <div className="max-w-2xl mx-auto">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">
              {language === "de" ? (
                <>
                  Bis zu{" "}
                  <span className="inline-block min-w-[2ch] text-center">
                    {animatedMinutes}
                  </span>{" "}
                  Minuten pro Tag gespart
                </>
              ) : (
                <>
                  Up to{" "}
                  <span className="inline-block min-w-[2ch] text-center">
                    {animatedMinutes}
                  </span>{" "}
                  minutes saved per day
                </>
              )}
            </h2>
            <p className="text-purple-100 mb-6">
              {t("dashboard.totalTimeSavedDesc")}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {t("dashboard.getStarted")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}
