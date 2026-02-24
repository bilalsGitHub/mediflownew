"use client";

import { useState, memo } from "react";
import { User, Stethoscope, List, FileText } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";

interface ConversationItem {
  speaker: "Doktor" | "Hasta";
  text: string;
}

interface TranscriptDisplayProps {
  conversation: ConversationItem[];
  rawTranscript?: string;
}

type ViewMode = "conversation" | "raw";

function TranscriptDisplay({
  conversation,
  rawTranscript,
}: TranscriptDisplayProps) {
  const { themeId } = useTheme();
  const { t } = useLanguage();
  const isDark = themeId === "dark";
  const hasConversation = conversation && conversation.length > 0;
  const [viewMode, setViewMode] = useState<ViewMode>(
    hasConversation ? "conversation" : "raw"
  );

  console.log(
    "📄 [TranscriptDisplay] RENDER - Conversation items:",
    conversation?.length || 0,
    "| Has raw transcript:",
    !!rawTranscript,
    "| View mode:",
    viewMode
  );

  // Eğer ne conversation ne de rawTranscript varsa
  if (!hasConversation && !rawTranscript) {
    return (
      <div className="bg-theme-card rounded-lg shadow-md p-6 border border-theme-border">
        <h2 className="text-2xl font-bold text-theme-text mb-4">
          {t("consultation.transcriptTitle")}
        </h2>
        <div className="bg-theme-primary-light p-4 rounded-md">
          <p className="text-theme-text-secondary italic">
            {t("consultation.transcriptNotFound")}
          </p>
        </div>
      </div>
    );
  }

  // Helper function to translate speaker name
  const getSpeakerLabel = (speaker: "Doktor" | "Hasta"): string => {
    if (speaker === "Doktor") {
      return t("consultation.doctor");
    }
    return t("consultation.patient");
  };

  // Build raw transcript from conversation if rawTranscript is not available
  const displayRawTranscript =
    rawTranscript ||
    conversation.map((item) => `${getSpeakerLabel(item.speaker)}: ${item.text}`).join("\n\n");

  return (
    <div className="bg-theme-card rounded-lg shadow-md p-6 border border-theme-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-theme-text">
          {t("consultation.transcriptTitle")}
        </h2>
        {(hasConversation || rawTranscript) && (
          <div className="flex items-center gap-2">
            {hasConversation && (
              <button
                onClick={() => setViewMode("conversation")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === "conversation"
                    ? "bg-theme-primary text-white"
                    : isDark
                    ? "bg-theme-card border border-theme-border text-theme-text hover:bg-theme-primary-light"
                    : "bg-theme-primary-light text-theme-text-secondary hover:bg-theme-primary-light"
                }`}>
                <List className="w-4 h-4" />
                <span>{t("consultation.speakersView")}</span>
              </button>
            )}
            {(rawTranscript || hasConversation) && (
              <button
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  viewMode === "raw"
                    ? "bg-theme-primary text-white"
                    : isDark
                    ? "bg-theme-card border border-theme-border text-theme-text hover:bg-theme-primary-light"
                    : "bg-theme-primary-light text-theme-text-secondary hover:bg-theme-primary-light"
                }`}>
                <FileText className="w-4 h-4" />
                <span>{t("consultation.rawTextView")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {viewMode === "conversation" && hasConversation ? (
        <div className="space-y-3">
          {conversation.map((item, index) => {
            const isDoctor = item.speaker === "Doktor";

            return (
              <div
                key={index}
                className={`flex gap-3 ${
                  isDoctor ? "flex-row-reverse" : "flex-row"
                }`}>
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isDoctor
                      ? "bg-theme-primary-light text-theme-primary"
                      : isDark
                      ? "bg-theme-card border border-theme-border text-theme-text-secondary"
                      : "bg-theme-primary-light text-theme-text-secondary"
                  }`}>
                  {isDoctor ? (
                    <Stethoscope className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message */}
                <div
                  className={`flex-1 max-w-[85%] rounded-lg p-3 ${
                    isDoctor
                      ? "bg-theme-primary-light border border-theme-primary"
                      : isDark
                      ? "bg-theme-card border border-theme-border"
                      : "bg-theme-primary-light border border-theme-border"
                  }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-xs font-semibold ${
                        isDoctor
                          ? "text-theme-primary"
                          : "text-theme-text-secondary"
                      }`}>
                      {getSpeakerLabel(item.speaker)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-theme-text">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-theme-primary-light p-4 rounded-md">
          <p className="text-theme-text whitespace-pre-wrap leading-relaxed">
            {displayRawTranscript}
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(TranscriptDisplay);
