'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3 saniye sonra otomatik kapan

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: isDark ? 'bg-green-900/90 border-green-700' : 'bg-green-50 border-green-200',
          text: isDark ? 'text-green-200' : 'text-green-800',
          icon: 'text-green-600',
        };
      case 'error':
        return {
          bg: isDark ? 'bg-red-900/90 border-red-700' : 'bg-red-50 border-red-200',
          text: isDark ? 'text-red-200' : 'text-red-800',
          icon: 'text-red-600',
        };
      case 'warning':
        return {
          bg: isDark ? 'bg-yellow-900/90 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
          text: isDark ? 'text-yellow-200' : 'text-yellow-800',
          icon: 'text-yellow-600',
        };
      case 'info':
        return {
          bg: isDark ? 'bg-blue-900/90 border-blue-700' : 'bg-blue-50 border-blue-200',
          text: isDark ? 'text-blue-200' : 'text-blue-800',
          icon: 'text-blue-600',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        ${colors.bg} ${colors.text}
        animate-in
      `}
    >
      <div className={colors.icon}>
        {getIcon()}
      </div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className={`${colors.text} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

