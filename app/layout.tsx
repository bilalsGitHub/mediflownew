import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/lib/ToastContext";
import ReduxProvider from "@/components/providers/ReduxProvider";

export const metadata: Metadata = {
  title: "MediFlow - Doktor Görüşme Asistanı",
  description: "Doktor-hasta görüşmelerini otomatik kaydeden ve AI ile analiz eden asistan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <ReduxProvider>
              <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
              </AuthProvider>
            </ReduxProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

