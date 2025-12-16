'use client';

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="doctor">
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
}

