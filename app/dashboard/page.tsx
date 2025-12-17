'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  FileText, 
  Sparkles, 
  ClipboardList, 
  MessageSquare, 
  Clock,
  LogOut,
  Plus,
  Zap,
  ChevronDown,
  Palette,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { Language } from '@/lib/translations';
import ThemeSelector from '@/components/ThemeSelector';
import FAQSection from '@/components/FAQSection';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
        <p className={isDark ? 'text-white' : 'text-theme-text-secondary'}>{t('common.loading')}</p>
      </div>
    );
  }

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: t('dashboard.feature1Title'),
      description: t('dashboard.feature1Desc'),
      time: t('dashboard.feature1Time'),
      color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      weight: 'font-bold', // Önemli
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('dashboard.feature2Title'),
      description: t('dashboard.feature2Desc'),
      time: t('dashboard.feature2Time'),
      color: isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600',
      weight: 'font-semibold',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t('dashboard.feature3Title'),
      description: t('dashboard.feature3Desc'),
      time: t('dashboard.feature3Time'),
      color: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600',
      weight: 'font-semibold', // AI vurgusu
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: t('dashboard.feature4Title'),
      description: t('dashboard.feature4Desc'),
      time: t('dashboard.feature4Time'),
      color: isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600',
      weight: 'font-medium',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('dashboard.feature5Title'),
      description: t('dashboard.feature5Desc'),
      time: t('dashboard.feature5Time'),
      color: isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600',
      weight: 'font-medium',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('dashboard.feature6Title'),
      description: t('dashboard.feature6Desc'),
      time: t('dashboard.feature6Time'),
      color: isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600',
      weight: 'font-medium',
    },
  ];

  // Debug: Ensure we have 6 features
  console.log('Dashboard features count:', features.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      {/* Top Navbar - Aktif sayfa göstergesi ile */}
      <nav className="bg-theme-card border-b-2 border-theme-primary/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-theme-text">MediFlow</h1>
              {/* Aktif sayfa göstergesi */}
              <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-theme-primary-light rounded-lg">
                <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
                <span className="text-xs font-medium text-theme-primary">Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Neue Konsultation - Mavi (ana aksiyon rengi) - Sadece giriş yapıldığında */}
              {user && (
                <button
                  onClick={() => router.push('/new-consultation')}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard.newConsultation')}</span>
                </button>
              )}

              {/* Login Button - Giriş yapılmadığında */}
              {!user && (
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  {t('auth.login')}
                </button>
              )}

              {/* Profile Dropdown */}
              {user && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-theme-primary-light rounded-lg transition-colors"
                  >
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
                        <p className="text-sm font-semibold text-theme-text">{user.fullName}</p>
                        <p className="text-xs text-theme-text-secondary">{user.email}</p>
                      </div>

                    {/* Language Selection */}
                    <div className="px-4 py-2 border-b border-theme-border">
                      <p className="text-xs font-medium text-theme-text-secondary uppercase mb-2">
                        {t('auth.language')}
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
                            }`}
                          >
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
                      className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-primary-light flex items-center gap-2 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                      {t('settings.theme')}
                    </button>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm text-theme-danger flex items-center gap-2 transition-colors rounded-b-lg ${
                        isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('auth.logout')}
                    </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-theme-text'}`}>
            {user ? `${t('dashboard.welcome')}, ${user.fullName.split(' ')[0]}` : 'MediFlow'}
          </h1>
          <p className={`text-xl mb-2 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-theme-text-secondary'}`}>
            {t('dashboard.purpose')}
          </p>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
            {t('dashboard.purposeDescription')}
          </p>
        </div>

        {/* CTA Button - Mavi (ana ürün rengi) */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => router.push(user ? '/new-consultation' : '/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-lg font-semibold shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/40 flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            {user ? t('dashboard.getStarted') : t('auth.login')}
          </button>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-theme-text'}`}>
            {t('dashboard.features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              // Ensure all 6 features are rendered
              return (
              <div
                key={index}
                className={`rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow ${
                  isDark 
                    ? 'bg-theme-card border-theme-border' 
                    : 'bg-theme-card border-theme-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} p-3 rounded-lg flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`${feature.weight} mb-2 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-theme-text-secondary'}`}>
                      {feature.description}
                    </p>
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{feature.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Time Saved Summary - Mavi → Mor gradient, desatüre */}
        <div className="bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-purple-600/90 rounded-lg p-8 text-white text-center shadow-lg mb-12">
          <div className="max-w-2xl mx-auto">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.totalTimeSaved')}
            </h2>
            <p className="text-blue-100/90">
              {t('dashboard.totalTimeSavedDesc')}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </div>
  );
}
