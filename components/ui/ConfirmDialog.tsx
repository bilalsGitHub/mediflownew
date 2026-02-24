"use client";

import React from "react";
import { X } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: ConfirmDialogProps) {
  const { themeId } = useTheme();
  const { t } = useLanguage();
  const isDark = themeId === "dark";

  const confirmButtonText = confirmText || t("common.delete");
  const cancelButtonText = cancelText || t("common.cancel");

  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        id="confirm-dialog"
        className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl ${
          isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}>
        <button
          id="confirm-dialog-close"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
            isDark
              ? "hover:bg-gray-700 text-gray-400"
              : "hover:bg-gray-100 text-gray-500"
          }`}>
          <X className="w-5 h-5" />
        </button>

        <h3 id="confirm-dialog-title" className="text-xl font-bold mb-2 pr-8">
          {title}
        </h3>
        <p
          id="confirm-dialog-message"
          className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {message}
        </p>

        <div
          id="confirm-dialog-actions"
          className="flex justify-end gap-3 flex-wrap">
          <button
            id="confirm-dialog-cancel"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {cancelButtonText}
          </button>
          <button
            id="confirm-dialog-confirm"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex-shrink-0 whitespace-nowrap">
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
