"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Mic,
  Plus,
  X,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Palette,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { Language } from "@/lib/translations";
import ThemeSelector from "@/components/ThemeSelector";
import QuickVoiceModal from "@/components/QuickVoiceModal";
import CalendarModal from "@/components/CalendarModal";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showQuickVoice, setShowQuickVoice] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const languages: { code: Language; label: string }[] = [
    { code: "de", label: "DE" },
    { code: "en", label: "ENG" },
  ];

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className="sticky top-0 z-30 bg-theme-card border-b border-theme-border">
      {/* Main Bar */}
      <div className="w-full px-4 py-3">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-theme-primary-light rounded-lg">
              <Menu className="w-6 h-6 text-theme-text" />
            </button>
            <Link
              href="/dashboard"
              className="text-xl font-semibold text-theme-text hover:text-theme-primary transition-colors cursor-pointer">
              MediFlow
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Calendar Button */}
            <button
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 px-3 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-light transition-colors shadow-sm"
              title={t("calendar.title") || "Kalender"}>
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t("calendar.button") || "Kalender"}
              </span>
            </button>

            {/* Appointments Button - Coming Soon */}
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 bg-theme-neutral text-white rounded-lg cursor-not-allowed opacity-60"
                title="Bald verfügbar">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t("appointments.button") || "Termine"}
                </span>
              </button>
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-theme-card border border-theme-border text-theme-text text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                Bald
              </div>
            </div>

            {/* Quick Voice Button */}
            <button
              onClick={() => setShowQuickVoice(true)}
              className="flex items-center gap-2 px-3 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-light transition-colors shadow-sm"
              title={t("quickVoice.title") || "Schnelle Spracherkennung"}>
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t("quickVoice.button") || "Sprache"}
              </span>
            </button>

            <Link
              href="/new-consultation"
              className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">
                {t("dashboard.newConsultation")}
              </span>
            </Link>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-theme-primary-light rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-theme-text-secondary" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-theme-card rounded-lg shadow-lg border border-theme-border z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-theme-border">
                      <p className="text-sm font-semibold text-theme-text">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        {user.email}
                      </p>
                    </div>

                    {/* Language Selection */}
                    <div className="px-4 py-2 border-b border-theme-border">
                      <p className="text-xs font-medium text-theme-text-secondary uppercase mb-2">
                        {t("auth.language")}
                      </p>
                      <div className="flex gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setShowProfileMenu(false);
                            }}
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              language === lang.code
                                ? "bg-theme-primary-light text-theme-primary font-medium"
                                : "bg-theme-primary-light text-theme-text hover:bg-theme-primary-light/80"
                            }`}>
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme Selection */}
                    <button
                      onClick={() => {
                        setShowThemeSelector(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-primary-light flex items-center gap-2 transition-colors">
                      <Palette className="w-4 h-4" />
                      {t("settings.theme")}
                    </button>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-theme-danger hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-lg">
                      <LogOut className="w-4 h-4" />
                      {t("auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* Quick Voice Modal */}
      <QuickVoiceModal
        isOpen={showQuickVoice}
        onClose={() => setShowQuickVoice(false)}
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </header>
  );
}
