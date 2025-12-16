"use client";

import { useState, useRef, useEffect, memo } from "react";
import {
  Sparkles,
  Copy,
  Loader2,
  Mic,
  Trash2,
  Plus,
  FileText,
  Edit2,
  X,
  Check,
} from "lucide-react";
import VoiceInput from "./VoiceInput";
import {
  PatientMessage,
  ReferralReason,
  ReferralResponse,
  Consultation,
  SavedDocument,
} from "@/lib/storage";
import { useTheme } from "@/lib/ThemeContext";
import { useToast } from "@/lib/ToastContext";
import { useLanguage } from "@/lib/LanguageContext";
import ConfirmDialog from "./ConfirmDialog";

type DocumentType = "patientMessage" | "referralReason" | "referralResponse";

interface DocumentGeneratorProps {
  consultation: Consultation;
  activeDocType: DocumentType | null;
  onSave: (document: SavedDocument) => void;
  onDelete: (documentId: string) => void;
  savedDocuments?: SavedDocument[];
  language?: "de" | "en";
}

function DocumentGenerator({
  consultation,
  activeDocType,
  onSave,
  onDelete,
  savedDocuments = [],
  language = "de",
}: DocumentGeneratorProps) {
  console.log(
    "📝 [DocumentGenerator] RENDER - Type:",
    activeDocType,
    "| Consultation ID:",
    consultation?.id,
    "| Documents:",
    savedDocuments?.length || 0
  );
  const { showSuccess, showError } = useToast();
  const { themeId } = useTheme();
  const isDark = themeId === "dark";
  const [isGenerating, setIsGenerating] = useState(false);
  const [doctorInstructions, setDoctorInstructions] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [acceptSuggestionDialogOpen, setAcceptSuggestionDialogOpen] =
    useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Filter documents by active type - ensure savedDocuments is always an array
  const documentsArray = Array.isArray(savedDocuments) ? savedDocuments : [];
  const filteredDocuments = documentsArray.filter(
    (doc) => doc.type === activeDocType
  );

  // Get current document
  const currentDocument = selectedDocumentId
    ? filteredDocuments.find((d) => d.id === selectedDocumentId)
    : null;

  // Convert document object to formatted text
  const documentToText = (
    doc: PatientMessage | ReferralReason | ReferralResponse | undefined
  ): string => {
    if (!doc) return "";

    if ("greeting" in doc) {
      // PatientMessage or ReferralResponse
      const pm = doc as PatientMessage | ReferralResponse;
      const parts: string[] = [];
      if (pm.greeting) parts.push(pm.greeting);
      if ("diagnosis" in pm && pm.diagnosis) parts.push(pm.diagnosis);
      if ("treatment" in pm && pm.treatment) parts.push(pm.treatment);
      if ("recommendations" in pm && pm.recommendations)
        parts.push(pm.recommendations);
      if ("closing" in pm && pm.closing) parts.push(pm.closing);
      if ("patientInfo" in pm && pm.patientInfo) parts.push(pm.patientInfo);
      if ("recommendedAction" in pm && pm.recommendedAction)
        parts.push(pm.recommendedAction);
      if ("thanks" in pm && pm.thanks) parts.push(pm.thanks);
      if (pm.doctorName || pm.doctorTitle) {
        parts.push(`${pm.doctorTitle || ""} ${pm.doctorName || ""}`.trim());
      }
      if (pm.date) parts.push(pm.date);
      return parts.join("\n\n");
    } else {
      // ReferralReason
      const rr = doc as ReferralReason;
      const parts: string[] = [];
      if (rr.date) parts.push(`Datum: ${rr.date}`);
      if (rr.diagnosis)
        parts.push(`Diagnose/Klinische Fragestellung:\n${rr.diagnosis}`);
      if (rr.requestedAction)
        parts.push(`Erbetene Maßnahme:\n${rr.requestedAction}`);
      if (rr.anamneseAndFindings)
        parts.push(`Anamnese und Befunde:\n${rr.anamneseAndFindings}`);
      return parts.join("\n\n");
    }
  };

  // Convert text to document object
  const textToDocument = (
    text: string
  ): PatientMessage | ReferralReason | ReferralResponse => {
    if (!activeDocType) return {} as any;

    if (activeDocType === "referralReason") {
      const lines = text.split("\n");
      const doc: ReferralReason = {};
      let currentSection = "";
      let currentContent: string[] = [];

      for (const line of lines) {
        if (line.startsWith("Datum:")) {
          doc.date = line.replace("Datum:", "").trim();
        } else if (line.startsWith("Diagnose/Klinische Fragestellung:")) {
          if (currentSection) {
            (doc as any)[currentSection] = currentContent.join("\n").trim();
          }
          currentSection = "diagnosis";
          currentContent = [];
        } else if (line.startsWith("Erbetene Maßnahme:")) {
          if (currentSection) {
            (doc as any)[currentSection] = currentContent.join("\n").trim();
          }
          currentSection = "requestedAction";
          currentContent = [];
        } else if (line.startsWith("Anamnese und Befunde:")) {
          if (currentSection) {
            (doc as any)[currentSection] = currentContent.join("\n").trim();
          }
          currentSection = "anamneseAndFindings";
          currentContent = [];
        } else if (currentSection) {
          currentContent.push(line);
        }
      }
      if (currentSection) {
        (doc as any)[currentSection] = currentContent.join("\n").trim();
      }
      return doc;
    } else {
      // PatientMessage or ReferralResponse - treat as simple text
      const paragraphs = text.split("\n\n").filter((p) => p.trim());
      const doc: any = {};

      if (activeDocType === "patientMessage") {
        if (paragraphs.length > 0) doc.greeting = paragraphs[0];
        if (paragraphs.length > 1) doc.diagnosis = paragraphs[1];
        if (paragraphs.length > 2) doc.treatment = paragraphs[2];
        if (paragraphs.length > 3) doc.recommendations = paragraphs[3];
        if (paragraphs.length > 4) doc.closing = paragraphs[4];
        if (paragraphs.length > 5) {
          const nameLine = paragraphs[paragraphs.length - 2];
          const dateLine = paragraphs[paragraphs.length - 1];
          if (nameLine && !dateLine.match(/^\d/)) {
            doc.doctorName = nameLine;
          }
          if (dateLine) doc.date = dateLine;
        }
      } else {
        // ReferralResponse
        if (paragraphs.length > 0) doc.greeting = paragraphs[0];
        if (paragraphs.length > 1) doc.patientInfo = paragraphs[1];
        if (paragraphs.length > 2) doc.diagnosis = paragraphs[2];
        if (paragraphs.length > 3) doc.recommendedAction = paragraphs[3];
        if (paragraphs.length > 4) doc.thanks = paragraphs[4];
        if (paragraphs.length > 5) {
          const nameLine = paragraphs[paragraphs.length - 2];
          const dateLine = paragraphs[paragraphs.length - 1];
          if (nameLine && !dateLine.match(/^\d/)) {
            doc.doctorName = nameLine;
          }
          if (dateLine) doc.date = dateLine;
        }
      }
      return doc;
    }
  };

  // Update text when document changes
  useEffect(() => {
    if (currentDocument) {
      setDocumentText(documentToText(currentDocument.content));
      setIsCreatingNew(false);
    } else if (isCreatingNew) {
      setDocumentText("");
    } else {
      setDocumentText("");
    }
  }, [currentDocument, isCreatingNew, activeDocType]);

  const handleGenerateDocument = async () => {
    if (!activeDocType) return;

    // Automatically create new document if not already creating and no document selected
    if (!isCreatingNew && !selectedDocumentId) {
      setIsCreatingNew(true);
      setSelectedDocumentId(null);
      setDocumentText("");
      setShowList(false);
    }

    setIsGenerating(true);
    setAiSuggestion(null);

    try {
      let response;

      // If updating existing document, use regenerate endpoint
      if (selectedDocumentId && currentDocument) {
        response = await fetch("/api/ai/regenerate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentType: activeDocType,
            consultationData: consultation,
            currentDocument: currentDocument,
            language,
          }),
        });
      } else {
        // Create new document
        response = await fetch("/api/ai/generate-document", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentType: activeDocType,
            consultationData: consultation,
            doctorInstructions: doctorInstructions || undefined,
            language,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Document generation failed");
      }

      const data = await response.json();
      console.log("🤖 AI Response:", {
        hasDocument: !!data.document,
        hasRewrittenText: !!data.rewrittenText,
        documentKeys: data.document ? Object.keys(data.document) : [],
        isRegenerating: !!(selectedDocumentId && currentDocument),
      });

      const formattedText = documentToText(
        data.document || data.rewrittenText || ""
      );
      console.log("📝 Formatted text length:", formattedText.length);
      console.log("📝 Current document text length:", documentText.length);
      console.log("📝 Are they different?", formattedText !== documentText);

      if (selectedDocumentId) {
        // Show as suggestion for existing document
        setAiSuggestion(formattedText);
        showSuccess("Neuer Vorschlag generiert!");
      } else {
        // Set directly for new document
        setDocumentText(formattedText);
        setIsCreatingNew(true);
        setSelectedDocumentId(null);
      }
    } catch (error: any) {
      console.error("Document generation error:", error);
      showError("Fehler beim Generieren: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;

    // Confirm before replacing existing content
    if (currentDocument) {
      setAcceptSuggestionDialogOpen(true);
      return;
    }

    setDocumentText(aiSuggestion);
    setAiSuggestion(null);
    showSuccess("Vorschlag übernommen!");
  };

  const handleConfirmAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    setDocumentText(aiSuggestion);
    setAiSuggestion(null);
    setAcceptSuggestionDialogOpen(false);
    showSuccess("Vorschlag übernommen!");
  };

  const handleRejectSuggestion = () => {
    setAiSuggestion(null);
    showSuccess("Vorschlag verworfen");
  };

  const handleSaveDocument = () => {
    if (!activeDocType || !documentText.trim()) {
      showError("Doküman içeriği boş olamaz!");
      return;
    }

    const content = textToDocument(documentText);
    const now = new Date().toISOString();

    if (currentDocument) {
      // Update existing
      const updated: SavedDocument = {
        ...currentDocument,
        content,
        updatedAt: now,
      };
      onSave(updated);
      showSuccess("Doküman güncellendi!");
    } else {
      // Create new
      const newDoc: SavedDocument = {
        id: Date.now().toString(),
        type: activeDocType,
        content,
        createdAt: now,
        updatedAt: now,
        title:
          documentText.substring(0, 50) +
          (documentText.length > 50 ? "..." : ""),
      };
      onSave(newDoc);
      setSelectedDocumentId(newDoc.id);
      setIsCreatingNew(false);
      showSuccess("Doküman kaydedildi!");
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteDocument = () => {
    if (!documentToDelete) return;
    onDelete(documentToDelete);
    if (selectedDocumentId === documentToDelete) {
      setSelectedDocumentId(null);
      setDocumentText("");
      setIsCreatingNew(false);
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleCreateNew = () => {
    setSelectedDocumentId(null);
    setDocumentText("");
    setIsCreatingNew(true);
    setAiSuggestion(null);
    setShowList(false);
  };

  const handleSelectDocument = (doc: SavedDocument) => {
    setSelectedDocumentId(doc.id);
    setIsCreatingNew(false);
    setAiSuggestion(null);
    setShowList(false);
  };

  const handleCopyDocument = () => {
    navigator.clipboard.writeText(documentText);
    showSuccess("Doküman kopyalandı!");
  };

  const handleClearDocument = () => {
    setClearDialogOpen(true);
  };

  const handleConfirmClearDocument = () => {
    setDocumentText("");
    setSelectedDocumentId(null);
    setIsCreatingNew(true);
    setClearDialogOpen(false);
    showSuccess("Doküman temizlendi!");
  };

  const handleVoiceTranscript = (text: string) => {
    const currentText = documentText || "";
    setDocumentText(currentText + (currentText ? " " : "") + text);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!activeDocType) {
    return (
      <div className="text-center py-12 text-theme-text-secondary">
        <p>Bitte wählen Sie einen Dokumenttyp aus</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with List Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowList(!showList)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "Dokument" : "Dokumente"}
            </span>
          </button>
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Neu erstellen</span>
          </button>
        </div>

        {/* Action Buttons - Sağ üst */}
        <div className="flex items-center gap-2">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            buttonSize="sm"
            className="!w-8 !h-8"
          />
          <button
            onClick={handleCopyDocument}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Kopieren">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearDocument}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Löschen">
            <Trash2 className="w-4 h-4" />
          </button>
          {/* AI generieren Button */}
          <button
            onClick={handleGenerateDocument}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generiert...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI generieren</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Document List */}
      {showList && filteredDocuments.length > 0 && (
        <div className="bg-theme-primary-light rounded-lg border border-theme-border p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {filteredDocuments
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
              .map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDocumentId === doc.id
                      ? "bg-purple-100 border-purple-500 border-2 shadow-sm"
                      : "bg-theme-card border-theme-border hover:border-theme-primary"
                  }`}
                  onClick={() => handleSelectDocument(doc)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText
                          className={`w-4 h-4 flex-shrink-0 ${
                            selectedDocumentId === doc.id
                              ? "text-purple-600"
                              : "text-theme-text-secondary"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium truncate ${
                            selectedDocumentId === doc.id
                              ? "text-purple-900"
                              : "text-theme-text"
                          }`}>
                          {doc.title || `Dokument ${formatDate(doc.createdAt)}`}
                        </p>
                      </div>
                      <p className="text-xs text-theme-text-secondary">
                        {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDocument(doc);
                        }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Bearbeiten">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Löschen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* AI Instructions (Collapsible) */}
      {doctorInstructions && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-600">
          <strong>AI Anweisungen:</strong> {doctorInstructions}
        </div>
      )}

      {/* AI Suggestion Banner */}
      {aiSuggestion && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-purple-900">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Neuer Vorschlag von AI</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptSuggestion}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4" />
                Übernehmen
              </button>
              <button
                onClick={handleRejectSuggestion}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors flex items-center gap-2">
                <X className="w-4 h-4" />
                Verwerfen
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-4 text-sm text-gray-800 max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner">
            {aiSuggestion}
          </div>
          <p className="text-xs text-purple-700 italic">
            💡 Dieser Vorschlag ersetzt den aktuellen Text im Editor, wenn Sie
            auf "Übernehmen" klicken.
          </p>
        </div>
      )}

      {/* Main Editor */}
      <div className="relative">
        {currentDocument && (
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Bearbeitet: {formatDate(currentDocument.updatedAt)}</span>
            <button
              onClick={() => {
                setSelectedDocumentId(null);
                setIsCreatingNew(true);
                setDocumentText("");
              }}
              className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="Dokumentinhalt hier eingeben oder mit AI generieren..."
          className={`w-full min-h-[500px] px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none leading-relaxed ${
            isDark
              ? "bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
              : "bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary"
          }`}
          style={{ fontFamily: "inherit" }}
        />
      </div>

      {/* Bottom Toolbar - Sadece Save butonu */}
      <div className="flex items-center justify-end pt-2 border-t border-gray-200">
        <button
          onClick={handleSaveDocument}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          {currentDocument ? "Aktualisieren" : "Speichern"}
        </button>
      </div>

      {/* Delete Document Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDeleteDocument}
        title={t("consultation.deleteDocumentTitle")}
        message={t("consultation.deleteDocumentMessage")}
      />

      {/* Clear Document Dialog */}
      <ConfirmDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleConfirmClearDocument}
        title={t("consultation.clearDocumentTitle")}
        message={t("consultation.clearDocumentMessage")}
      />

      {/* Accept AI Suggestion Dialog */}
      <ConfirmDialog
        isOpen={acceptSuggestionDialogOpen}
        onClose={() => setAcceptSuggestionDialogOpen(false)}
        onConfirm={handleConfirmAcceptSuggestion}
        title={
          language === "de" ? "AI-Vorschlag übernehmen" : "Accept AI Suggestion"
        }
        message={
          language === "de"
            ? "Möchten Sie den aktuellen Dokumentinhalt mit dem AI-Vorschlag ersetzen? Diese Aktion kann nicht rückgängig gemacht werden (bis Sie speichern)."
            : "Do you want to replace the current document content with the AI suggestion? This action cannot be undone (until you save)."
        }
        confirmText={language === "de" ? "Übernehmen" : "Accept"}
      />
    </div>
  );
}

export default memo(DocumentGenerator);
