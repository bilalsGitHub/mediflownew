"use client";

import React, { useState, useEffect, memo } from "react";
import { Mic, Copy, X, Plus } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useToast } from "@/lib/ToastContext";
import { useLanguage } from "@/lib/LanguageContext";

interface SOAPNoteProps {
  initialValues?: {
    subjektiv?: string;
    objektiv?: string;
    beurteilungPlan?: string;
    anamnese?: string;
    untersuchung?: string;
    kontaktgrund?: string;
    aktuellerZustand?: string;
  };

  onSave?: (values: {
    subjektiv: string;
    objektiv: string;
    beurteilungPlan: string;
    anamnese: string;
    untersuchung: string;
    kontaktgrund: string;
    aktuellerZustand: string;
  }) => void;

  onDelete?: (field: string) => void;
  onAdd?: (field: string) => void;

  editable?: boolean;
  template?: "dokumentation" | "kurzdokumentation";

  onAddOrAdjust?: (field: string, currentText: string) => void;
}

interface SectionProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onDelete?: () => void;
  onAdd?: () => void;
  fieldName?: string;
  isDark: boolean;
  editable: boolean;
  onAddOrAdjust?: (field: string, currentText: string) => void;
  onCopy: (text: string) => void;
}

function Section({
  label,
  value,
  placeholder,
  onChange,
  onDelete,
  onAdd,
  fieldName,
  isDark,
  editable,
  onAddOrAdjust,
  onCopy,
}: SectionProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const exists = value !== undefined;
  const hasContent = value && value.trim().length > 0;

  if (!exists && onAdd) {
    return (
      <div className="flex items-start gap-4 mb-6">
        <div className="w-48 flex-shrink-0" />
        <button
          onClick={onAdd}
          className="flex-1 py-3 border-2 border-dashed rounded-lg text-theme-text-secondary hover:text-theme-text border-theme-border">
          <Plus className="inline w-4 h-4 mr-2" />
          {label} ekle
        </button>
      </div>
    );
  }

  return (
    <div id={`soap-section-${fieldName || label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-start gap-4 mb-6">
      <div className="w-48 font-bold text-sm flex-shrink-0">{label}</div>
      <div className="flex-1 relative">
        {editable ? (
          <textarea
            id={`soap-textarea-${fieldName || label.toLowerCase().replace(/\s+/g, '-')}`}
            ref={textareaRef}
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={`w-full min-h-[120px] p-3 pb-12 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-theme-primary ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
                : "bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary"
            }`}
          />
        ) : (
          <div className="p-3 border rounded bg-gray-50 whitespace-pre-wrap">
            {value || placeholder}
          </div>
        )}

        {editable && (
          <>
            {/* Temizle - Sağ üst */}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Sil"
                className="absolute top-2 right-2 opacity-30 hover:opacity-60 transition-opacity">
                <X
                  className={`w-4 h-4 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } hover:text-red-500`}
                />
              </button>
            )}
            {/* Kopyala ve Sesle Ekle - Sağ alt */}
            {hasContent && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                {/* Sesle Ekle - Solda */}
                {fieldName && onAddOrAdjust && (
                  <button
                    onClick={() =>
                      onAddOrAdjust(
                        fieldName,
                        textareaRef.current?.value || value || ""
                      )
                    }
                    title="Sesle ekle"
                    className="opacity-40 hover:opacity-100 active:opacity-100 transition-all hover:glow-purple active:glow-purple">
                    <Mic
                      className={`w-4 h-4 ${
                        isDark ? "text-purple-400" : "text-purple-500"
                      }`}
                    />
                  </button>
                )}
                {/* Kopyala - Sağda */}
                <button
                  onClick={() => onCopy(value!)}
                  title="Kopyala"
                  className="opacity-35 hover:opacity-70 transition-opacity">
                  <Copy
                    className={`w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } hover:text-theme-primary`}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SOAPNote({
  initialValues = {},
  onSave,
  onDelete,
  onAdd,
  editable = true,
  template = "dokumentation",
  onAddOrAdjust,
}: SOAPNoteProps) {
  console.log(
    "📋 [SOAPNote] RENDER - Template:",
    template,
    "| Editable:",
    editable
  );
  const { themeId } = useTheme();
  const { showSuccess } = useToast();
  const { t } = useLanguage();
  const isDark = themeId === "dark";

  const [values, setValues] = useState({
    subjektiv: initialValues.subjektiv || "",
    objektiv: initialValues.objektiv || "",
    beurteilungPlan: initialValues.beurteilungPlan || "",
    anamnese: initialValues.anamnese || "",
    untersuchung: initialValues.untersuchung || "",
    kontaktgrund: initialValues.kontaktgrund || "",
    aktuellerZustand: initialValues.aktuellerZustand || "",
  });

  // Initial values değiştiğinde state'i güncelle
  useEffect(() => {
    setValues({
      subjektiv: initialValues.subjektiv || "",
      objektiv: initialValues.objektiv || "",
      beurteilungPlan: initialValues.beurteilungPlan || "",
      anamnese: initialValues.anamnese || "",
      untersuchung: initialValues.untersuchung || "",
      kontaktgrund: initialValues.kontaktgrund || "",
      aktuellerZustand: initialValues.aktuellerZustand || "",
    });
  }, [initialValues]);

  const handleValueChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = (field: string) => {
    setValues((prev) => ({ ...prev, [field]: "" }));
    onDelete?.(field);
  };

  const handleAdd = (field: string) => {
    onAdd?.(field);
  };

  const handleSave = () => {
    onSave?.(values);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Kopyalandı!");
  };

  if (template === "kurzdokumentation") {
    return (
      <div id="soap-note" data-template="kurzdokumentation">
        <Section
          label="Anamnese"
          value={values.anamnese}
          placeholder={t("soap.anamnesePlaceholder")}
          onChange={(value) => handleValueChange("anamnese", value)}
          onDelete={() => handleDelete("anamnese")}
          onAdd={() => handleAdd("anamnese")}
          fieldName="anamnese"
          isDark={isDark}
          editable={editable}
          onAddOrAdjust={onAddOrAdjust}
          onCopy={handleCopy}
        />
        <Section
          label="Untersuchung"
          value={values.untersuchung}
          placeholder={t("soap.untersuchungPlaceholder")}
          onChange={(value) => handleValueChange("untersuchung", value)}
          onDelete={() => handleDelete("untersuchung")}
          onAdd={() => handleAdd("untersuchung")}
          fieldName="untersuchung"
          isDark={isDark}
          editable={editable}
          onAddOrAdjust={onAddOrAdjust}
          onCopy={handleCopy}
        />
        <Section
          label="Beurteilung & Plan"
          value={values.beurteilungPlan}
          placeholder={t("soap.beurteilungPlanShortPlaceholder")}
          onChange={(value) => handleValueChange("beurteilungPlan", value)}
          onDelete={() => handleDelete("beurteilungPlan")}
          onAdd={() => handleAdd("beurteilungPlan")}
          fieldName="beurteilungPlan"
          isDark={isDark}
          editable={editable}
          onAddOrAdjust={onAddOrAdjust}
          onCopy={handleCopy}
        />
      </div>
    );
  }

  return (
    <div id="soap-note" data-template="dokumentation">
      <Section
        label="Kontaktgrund"
        value={values.kontaktgrund}
        placeholder={t("soap.kontaktgrundPlaceholder")}
        onChange={(value) => handleValueChange("kontaktgrund", value)}
        onDelete={() => handleDelete("kontaktgrund")}
        onAdd={() => handleAdd("kontaktgrund")}
        fieldName="kontaktgrund"
        isDark={isDark}
        editable={editable}
        onAddOrAdjust={onAddOrAdjust}
        onCopy={handleCopy}
      />
      <Section
        label="Aktueller Zustand"
        value={values.aktuellerZustand}
        placeholder={t("soap.aktuellerZustandPlaceholder")}
        onChange={(value) => handleValueChange("aktuellerZustand", value)}
        onDelete={() => handleDelete("aktueller_zustand")}
        onAdd={() => handleAdd("aktueller_zustand")}
        fieldName="aktueller_zustand"
        isDark={isDark}
        editable={editable}
        onAddOrAdjust={onAddOrAdjust}
        onCopy={handleCopy}
      />
      <Section
        label="Subjektiv"
        value={values.subjektiv}
        placeholder={t("soap.subjektivPlaceholder")}
        onChange={(value) => handleValueChange("subjektiv", value)}
        onDelete={() => handleDelete("subjektiv")}
        onAdd={() => handleAdd("subjektiv")}
        fieldName="subjektiv"
        isDark={isDark}
        editable={editable}
        onAddOrAdjust={onAddOrAdjust}
        onCopy={handleCopy}
      />
      <Section
        label="Objektiv"
        value={values.objektiv}
        placeholder={t("soap.objektivPlaceholder")}
        onChange={(value) => handleValueChange("objektiv", value)}
        onDelete={() => handleDelete("objektiv")}
        onAdd={() => handleAdd("objektiv")}
        fieldName="objektiv"
        isDark={isDark}
        editable={editable}
        onAddOrAdjust={onAddOrAdjust}
        onCopy={handleCopy}
      />
      <Section
        label="Beurteilung & Plan"
        value={values.beurteilungPlan}
        placeholder={t("soap.beurteilungPlanPlaceholder")}
        onChange={(value) => handleValueChange("beurteilungPlan", value)}
        onDelete={() => handleDelete("beurteilungPlan")}
        onAdd={() => handleAdd("beurteilungPlan")}
        fieldName="beurteilungPlan"
        isDark={isDark}
        editable={editable}
        onAddOrAdjust={onAddOrAdjust}
        onCopy={handleCopy}
      />

      {/* Save Button */}
      <div id="soap-note-save-button" className="mt-6 flex justify-center">
        <button
          id="soap-note-save"
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? "bg-theme-primary text-white hover:bg-blue-600"
              : "bg-theme-primary text-white hover:bg-blue-700"
          }`}>
          Speichern
        </button>
      </div>
    </div>
  );
}

export default memo(SOAPNote);
