"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

const COUNTRIES = [
  "Germany",
  "Turkey",
  "United States",
  "United Kingdom",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "Other",
];

const LANGUAGES = [
  { value: "de", label: "Deutsch" },
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    country: "",
    age: "",
    language: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    if (!formData.email || !formData.fullName) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        country: formData.country || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        language: formData.language || undefined,
      });

      if (success) {
        router.push("/dashboard");
      } else {
        setError("Bu e-posta adresi zaten kullanılıyor");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="w-full max-w-md">
        <div className="bg-theme-card rounded-lg shadow-lg p-8 border border-theme-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">MediFlow</h1>
            <p className="text-theme-text-secondary">Doktor Kayıt</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-theme-text mb-2">
                Ad Soyad <span className="text-theme-danger">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder="Dr. Max Mustermann"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-2">
                E-posta <span className="text-theme-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder="doctor@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-2">
                Şifre <span className="text-theme-danger">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder="En az 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text mb-2">
                Şifre Tekrar <span className="text-theme-danger">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-theme-text mb-2">
                Ülke
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
              >
                <option value="">Seçiniz</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-theme-text mb-2">
                Yaş
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
                placeholder="25"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-theme-text mb-2">
                Dil
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-card text-theme-text"
              >
                <option value="">Seçiniz</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
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
                  <span>Kayıt yapılıyor...</span>
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-theme-text-secondary">
              Zaten hesabınız var mı?{" "}
              <a
                href="/login"
                className="text-theme-primary hover:text-theme-primary-dark font-medium"
              >
                Giriş Yap
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

