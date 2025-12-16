"use client";

import { Edit2, Check, X, RotateCcw, Mic } from "lucide-react";
import { useState } from "react";
import DoctorNoteCreator from "./DoctorNoteCreator";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";

interface Analysis {
  patient_complaint: string;
  symptoms: string[];
  duration_frequency: string;
  preliminary_summary: string;
  doctor_notes_draft: string;
}

interface AnalysisDisplayProps {
  analysis: Analysis;
  onEdit: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onReanalyze?: () => void;
  isLoading?: boolean;
  showDoctorNoteCreator?: boolean;
}

export default function AnalysisDisplay({
  analysis,
  onEdit,
  onApprove,
  onReject,
  onReanalyze,
  isLoading = false,
  showDoctorNoteCreator: initialShowCreator = false,
}: AnalysisDisplayProps) {
  const { t } = useLanguage();
  console.log(
    "🔍 [AnalysisDisplay] RENDER - Has analysis:",
    !!analysis,
    "| Loading:",
    isLoading
  );
  const { themeId } = useTheme();
  const isDark = themeId === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(analysis.doctor_notes_draft);
  const [showDoctorNoteCreator, setShowDoctorNoteCreator] =
    useState(initialShowCreator);

  const handleSave = () => {
    onEdit(editedNotes);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">AI Analiz Sonuçları</h2>

      {/* Hasta Şikayeti */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
          Hasta Şikayeti
        </h3>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
          {analysis.patient_complaint || "Belirtilmemiş"}
        </p>
      </div>

      {/* Semptomlar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
          Semptomlar
        </h3>
        <ul className="space-y-2">
          {analysis.symptoms && analysis.symptoms.length > 0 ? (
            analysis.symptoms.map((symptom, index) => (
              <li
                key={index}
                className="text-gray-800 bg-gray-50 p-3 rounded-md flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{symptom}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">Belirtilmemiş</li>
          )}
        </ul>
      </div>

      {/* Süre/Sıklık */}
      {analysis.duration_frequency && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
            Süre / Sıklık
          </h3>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
            {analysis.duration_frequency}
          </p>
        </div>
      )}

      {/* Ön Özet */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
          Ön Özet
        </h3>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
          {analysis.preliminary_summary || "Belirtilmemiş"}
        </p>
      </div>

      {/* Doktor Notu Taslağı */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">
            Doktor Notu Taslağı
          </h3>
          <div className="flex items-center gap-2">
            {!isEditing && !showDoctorNoteCreator && (
              <>
                <button
                  onClick={() => setShowDoctorNoteCreator(true)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-semibold">
                  <Mic className="w-4 h-4" />
                  Doktor Notu Oluştur
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                  <Edit2 className="w-4 h-4" />
                  Düzenle
                </button>
              </>
            )}
          </div>
        </div>

        {showDoctorNoteCreator && (
          <div className="mb-4">
            <DoctorNoteCreator
              initialText={analysis.doctor_notes_draft}
              onSave={(text) => {
                onEdit(text);
                setEditedNotes(text);
                setShowDoctorNoteCreator(false);
                setIsEditing(false);
              }}
              onCancel={() => {
                setShowDoctorNoteCreator(false);
              }}
            />
          </div>
        )}
        {!showDoctorNoteCreator && (
          <>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-y min-h-[120px] ${
                    isDark
                      ? "bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
                      : "bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary"
                  }`}
                  placeholder={t("analysis.doctorNotesPlaceholder")}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedNotes(analysis.doctor_notes_draft);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {analysis.doctor_notes_draft}
              </p>
            )}
          </>
        )}
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Check className="w-5 h-5" />
          Onayla ve Kaydet
        </button>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <RotateCcw className="w-5 h-5" />
            Yeniden Analiz Et
          </button>
        )}
        <button
          onClick={onReject}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <X className="w-5 h-5" />
          Reddet
        </button>
      </div>
    </div>
  );
}
