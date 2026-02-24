"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Mic, Copy } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useToast } from "@/lib/ToastContext";
import { useLanguage } from "@/lib/LanguageContext";

interface AnamneseSectionProps {
  kontaktgrund?: string;
  aktuellerZustand?: string;
  onKontaktgrundChange?: (value: string) => void;
  onAktuellerZustandChange?: (value: string) => void;
  onKontaktgrundDelete?: () => void;
  onAktuellerZustandDelete?: () => void;
  onKontaktgrundAdd?: () => void;
  onAktuellerZustandAdd?: () => void;
  editable?: boolean;
  onAddOrAdjust?: (
    field: "kontaktgrund" | "aktuellerZustand",
    currentText: string
  ) => void;
}

export default function AnamneseSection({
  kontaktgrund,
  aktuellerZustand,
  onKontaktgrundChange,
  onAktuellerZustandChange,
  onKontaktgrundDelete,
  onAktuellerZustandDelete,
  onKontaktgrundAdd,
  onAktuellerZustandAdd,
  editable = true,
  onAddOrAdjust,
}: AnamneseSectionProps) {
  const { themeId } = useTheme();
  const { showSuccess } = useToast();
  const { t } = useLanguage();
  const [localKontaktgrund, setLocalKontaktgrund] = useState(kontaktgrund);
  const [localAktuellerZustand, setLocalAktuellerZustand] =
    useState(aktuellerZustand);
  const kontaktgrundInputRef = useRef<HTMLInputElement>(null);
  const aktuellerZustandTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = themeId === "dark";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Kopyalandı!");
  };

  // Only sync when prop changes from undefined to a value (section added) or from value to undefined (section removed)
  const prevKontaktgrundRef = useRef(kontaktgrund);
  const prevAktuellerZustandRef = useRef(aktuellerZustand);

  useEffect(() => {
    const wasUndefined = prevKontaktgrundRef.current === undefined;
    const isNowDefined = kontaktgrund !== undefined;
    const wasDefined = prevKontaktgrundRef.current !== undefined;
    const isNowUndefined = kontaktgrund === undefined;

    if ((wasUndefined && isNowDefined) || (wasDefined && isNowUndefined)) {
      setLocalKontaktgrund(kontaktgrund);
      prevKontaktgrundRef.current = kontaktgrund;
    }
  }, [kontaktgrund]);

  useEffect(() => {
    const wasUndefined = prevAktuellerZustandRef.current === undefined;
    const isNowDefined = aktuellerZustand !== undefined;
    const wasDefined = prevAktuellerZustandRef.current !== undefined;
    const isNowUndefined = aktuellerZustand === undefined;

    if ((wasUndefined && isNowDefined) || (wasDefined && isNowUndefined)) {
      setLocalAktuellerZustand(aktuellerZustand);
      prevAktuellerZustandRef.current = aktuellerZustand;
    }
  }, [aktuellerZustand]);

  const handleKontaktgrundChange = (value: string) => {
    setLocalKontaktgrund(value);
    if (onKontaktgrundChange) {
      onKontaktgrundChange(value);
    }
  };

  const handleAktuellerZustandChange = (value: string) => {
    setLocalAktuellerZustand(value);
    if (onAktuellerZustandChange) {
      onAktuellerZustandChange(value);
    }
  };

  return (
    <div className="mb-6">
      <h3
        className={`text-lg font-bold mb-4 ${
          isDark ? "text-white" : "text-theme-text"
        }`}>
        Anamnese
      </h3>

      <div className="space-y-3">
        {/* Kontaktgrund */}
        {localKontaktgrund !== undefined && localKontaktgrund !== null ? (
          <div className="flex items-start gap-4">
            <label
              className={`text-sm font-bold w-48 flex-shrink-0 ${
                isDark ? "text-white" : "text-theme-text"
              }`}>
              Kontaktgrund
            </label>
            <div className="flex-1 relative">
              {editable ? (
                <input
                  ref={kontaktgrundInputRef}
                  type="text"
                  value={localKontaktgrund}
                  onChange={(e) => handleKontaktgrundChange(e.target.value)}
                  placeholder={t("anamnese.kontaktgrundPlaceholder")}
                  className={`w-full min-h-[60px] px-3 py-2 pb-10 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent ${
                    isDark
                      ? "bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
                      : "bg-theme-card text-theme-text border-theme-border"
                  }`}
                />
              ) : (
                <p className={isDark ? "text-white" : "text-theme-text"}>
                  {localKontaktgrund}
                </p>
              )}
              {editable &&
                localKontaktgrund &&
                localKontaktgrund.trim().length > 0 && (
                  <>
                    {/* Temizle - Sağ üst */}
                    {onKontaktgrundDelete && (
                      <button
                        onClick={onKontaktgrundDelete}
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
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      {/* Sesle Ekle - Solda */}
                      {onAddOrAdjust && (
                        <button
                          onClick={() =>
                            onAddOrAdjust(
                              "kontaktgrund",
                              kontaktgrundInputRef.current?.value ||
                                localKontaktgrund
                            )
                          }
                          title="Mit Stimme bearbeiten"
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
                        onClick={() => handleCopy(localKontaktgrund)}
                        title="Kopieren"
                        className="opacity-35 hover:opacity-70 transition-opacity">
                        <Copy
                          className={`w-4 h-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } hover:text-theme-primary`}
                        />
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>
        ) : editable && onKontaktgrundAdd ? (
          <div className="flex items-start gap-4">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex-1">
              <button
                onClick={onKontaktgrundAdd}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                <span>Kontaktgrund ekle</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Aktueller Zustand */}
        {localAktuellerZustand !== undefined &&
        localAktuellerZustand !== null ? (
          <div className="flex items-start gap-4">
            <label
              className={`text-sm font-bold w-48 flex-shrink-0 ${
                isDark ? "text-white" : "text-theme-text"
              }`}>
              Aktueller Zustand
            </label>
            <div className="flex-1 relative">
              {editable ? (
                <textarea
                  ref={aktuellerZustandTextareaRef}
                  value={localAktuellerZustand}
                  onChange={(e) => handleAktuellerZustandChange(e.target.value)}
                  placeholder={t("anamnese.aktuellerZustandPlaceholder")}
                  className={`w-full min-h-[100px] px-3 py-2 pb-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-y ${
                    isDark
                      ? "bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
                      : "bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary"
                  }`}
                />
              ) : (
                <p
                  className={`whitespace-pre-wrap ${
                    isDark ? "text-white" : "text-theme-text"
                  }`}>
                  {localAktuellerZustand}
                </p>
              )}
              {editable &&
                localAktuellerZustand &&
                localAktuellerZustand.trim().length > 0 && (
                  <>
                    {/* Temizle - Sağ üst */}
                    {onAktuellerZustandDelete && (
                      <button
                        onClick={onAktuellerZustandDelete}
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
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      {/* Sesle Ekle - Solda */}
                      {onAddOrAdjust && (
                        <button
                          onClick={() =>
                            onAddOrAdjust(
                              "aktuellerZustand",
                              aktuellerZustandTextareaRef.current?.value ||
                                localAktuellerZustand
                            )
                          }
                          title="Mit Stimme bearbeiten"
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
                        onClick={() => handleCopy(localAktuellerZustand)}
                        title="Kopieren"
                        className="opacity-35 hover:opacity-70 transition-opacity">
                        <Copy
                          className={`w-4 h-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } hover:text-theme-primary`}
                        />
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>
        ) : editable && onAktuellerZustandAdd ? (
          <div className="flex items-start gap-4">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex-1">
              <button
                onClick={onAktuellerZustandAdd}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                <span>Aktueller Zustand ekle</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
