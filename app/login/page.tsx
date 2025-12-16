"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Login attempt started");
      // Add timeout to prevent infinite loading
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.error("Login timeout after 10 seconds");
          resolve(false);
        }, 10000); // 10 second timeout
      });

      const success = await Promise.race([loginPromise, timeoutPromise]);
      
      console.log("Login result:", success);
      
      if (success) {
        console.log("Redirecting to dashboard");
        router.push("/dashboard");
      } else {
        setError("E-posta veya şifre hatalı");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      console.log("Login process finished, setting isLoading to false");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="w-full max-w-md">
        <div className="bg-theme-card rounded-lg shadow-lg p-8 border border-theme-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">MediFlow</h1>
            <p className="text-theme-text-secondary">{t('auth.login')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder={t("auth.passwordPlaceholder")}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-theme-primary hover:bg-theme-primary-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-theme-text-secondary">
              {t('auth.noAccount')}{" "}
              <a
                href="/register"
                className="text-theme-primary hover:text-theme-primary-dark font-medium"
              >
                {t('auth.registerHere')}
              </a>
            </p>
          </div>

          <div className="mt-6 p-4 bg-theme-primary-light rounded-lg">
            <p className="text-xs text-theme-text-secondary text-center mb-2">{t('auth.testUser')}:</p>
            <p className="text-xs text-theme-text text-center">
              {t('auth.testEmail')}
            </p>
            <p className="text-xs text-theme-text text-center">
              {t('auth.testPassword')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

