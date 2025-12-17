"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import RecordingButton from "@/components/RecordingButton";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import Timer from "@/components/Timer";
import Tabs from "@/components/Tabs";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { storage, Consultation } from "@/lib/storage";
import { Loader2, FileText, MessageSquare, ClipboardList, RefreshCw } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import SOAPNote from "@/components/SOAPNote";
import AnamneseSection from "@/components/AnamneseSection";
import AddOrAdjustModal from "@/components/AddOrAdjustModal";
import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { useToast } from "@/lib/ToastContext";

type Analysis = {
  patient_complaint: string;
  symptoms: string[];
  duration_frequency: string;
  preliminary_summary: string;
  doctor_notes_draft: string;
};

export default function NewConsultationPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { themeId } = useTheme();
  const { showSuccess, showError } = useToast();
  const isDark = themeId === "dark";
  const [step, setStep] = useState<"recording" | "analyzing" | "results">(
    "recording"
  );
  const [activeTab, setActiveTab] = useState<"transcription" | "note">(
    "transcription"
  );
  const [soapNote, setSoapNote] = useState<{
    subjektiv?: string;
    objektiv?: string;
    beurteilungPlan?: string;
    anamnese?: string;
    untersuchung?: string;
  }>({});
  const [anamnese, setAnamnese] = useState<{
    kontaktgrund?: string;
    aktuellerZustand?: string;
  }>({});
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("dokumentation");
  const [isAddOrAdjustOpen, setIsAddOrAdjustOpen] = useState(false);
  const [addOrAdjustTarget, setAddOrAdjustTarget] = useState<{
    type:
      | "subjektiv"
      | "objektiv"
      | "beurteilungPlan"
      | "anamnese"
      | "untersuchung"
      | "kontaktgrund"
      | "aktuellerZustand"
      | null;
    currentText?: string;
  }>({ type: null });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isTemplateChanging, setIsTemplateChanging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [conversation, setConversation] = useState<
    Array<{ speaker: "Doktor" | "Hasta"; text: string }>
  >([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string>("");
  const [status, setStatus] = useState<
    | "draft"
    | "approved"
    | "rejected"
    | "not_transferred"
    | "transferred"
    | "completed"
  >("not_transferred");
  const [patientName, setPatientName] = useState<string>("");
  const [isEditingPatientName, setIsEditingPatientName] = useState(false);
  const [editedPatientName, setEditedPatientName] = useState("");
  const patientNameInputRef = useRef<HTMLInputElement>(null);

  // Sync editedPatientName when patientName changes
  useEffect(() => {
    setEditedPatientName(patientName);
  }, [patientName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingPatientName && patientNameInputRef.current) {
      patientNameInputRef.current.focus();
      patientNameInputRef.current.select();
    }
  }, [isEditingPatientName]);

  const handlePatientNameClick = () => {
    setIsEditingPatientName(true);
    setEditedPatientName(patientName);
  };

  const handlePatientNameBlur = () => {
    setIsEditingPatientName(false);
    setPatientName(editedPatientName.trim());
  };

  const handlePatientNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setIsEditingPatientName(false);
      setPatientName(editedPatientName.trim());
    } else if (e.key === "Escape") {
      setIsEditingPatientName(false);
      setEditedPatientName(patientName);
    }
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setIsRecording(false);
    setStep("analyzing");
    setIsProcessing(true);
    setError(null);

    try {
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error("Ses kaydı boş. Lütfen tekrar kaydedin.");
      }

      console.log("Recording completed:", {
        blobSize: blob.size,
        blobType: blob.type,
        language: language,
      });

      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("language", language); // Send current language

      console.log("Sending to transcribe API...");
      const transcribeResponse = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}));
        console.error("Transcribe API error:", errorData);
        throw new Error(errorData.error || "Transkript oluşturulamadı");
      }

      const responseData = await transcribeResponse.json();
      console.log("Transcribe response:", {
        hasTranscript: !!responseData.transcript,
        transcriptLength: responseData.transcript?.length || 0,
        keys: Object.keys(responseData),
      });

      // Handle different response formats
      const newTranscript =
        responseData.transcript ||
        responseData.text ||
        responseData.transcription ||
        "";

      if (
        !newTranscript ||
        typeof newTranscript !== "string" ||
        newTranscript.trim().length === 0
      ) {
        console.error("Empty transcript received:", responseData);
        throw new Error(
          "Transkript boş geldi. Lütfen ses kaydını kontrol edin veya daha uzun bir kayıt yapın."
        );
      }

      console.log("Transcript received:", {
        length: newTranscript.length,
        preview: newTranscript.substring(0, 100),
      });

      setTranscript(newTranscript.trim());

      // Step 2: Identify speakers (Doktor/Hasta)
      let finalConversation: any[] = [];
      const speakerResponse = await fetch("/api/ai/identify-speakers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: newTranscript }),
      });

      if (speakerResponse.ok) {
        const { conversation: newConversation } = await speakerResponse.json();
        finalConversation = newConversation || [];
        setConversation(finalConversation);
      } else {
        // If speaker identification fails, continue without it
        console.warn("Speaker identification failed, continuing without it");
        finalConversation = [];
        setConversation([]);
      }

      // Step 3: Analyze transcript
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: newTranscript, language }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Analiz yapılamadı");
      }

      const { analysis: newAnalysis } = await analyzeResponse.json();
      setAnalysis(newAnalysis);

      // Create consultation record (temporary ID, will be replaced by UUID from Supabase)
      const tempId = `temp-${Date.now()}`;
      setConsultationId(tempId);
      // Auto-fill anamnese from analysis
      const autoAnamnese = {
        kontaktgrund: newAnalysis.patient_complaint || "",
        aktuellerZustand: newAnalysis.symptoms.join(", ") || "",
      };
      setAnamnese(autoAnamnese);

      // Auto-fill SOAP note from analysis
      const autoSoapNote = {
        subjektiv: newAnalysis.patient_complaint || "",
        objektiv: "",
        beurteilungPlan: newAnalysis.doctor_notes_draft || "",
      };
      setSoapNote(autoSoapNote);

      const consultation: Consultation = {
        id: tempId, // Will be replaced with UUID by storage.save()
        patientName: patientName.trim() || undefined,
        transcript: newTranscript,
        conversation:
          finalConversation.length > 0 ? finalConversation : undefined,
        analysis: newAnalysis,
        doctorNotes: newAnalysis.doctor_notes_draft,
        status: status,
        anamnese: autoAnamnese,
        soapNote: autoSoapNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving consultation:", {
        tempId,
        hasTranscript: !!consultation.transcript,
        transcriptLength: consultation.transcript?.length,
        hasAnalysis: !!consultation.analysis,
        hasConversation: !!consultation.conversation,
      });

      // Save consultation and get the new UUID
      let savedConsultationId: string;
      try {
        savedConsultationId = await storage.save(consultation);
        console.log("Consultation saved with ID:", savedConsultationId);
      } catch (saveError: any) {
        console.error("Failed to save consultation:", saveError);
        throw new Error(
          `Konsültasyon kaydedilemedi: ${
            saveError.message || "Bilinmeyen hata"
          }`
        );
      }

      // Update state with the new ID
      setConsultationId(savedConsultationId);

      // Redirect to consultation detail page with the new UUID
      try {
        router.push(`/consultation/${savedConsultationId}`);
      } catch (routerError: any) {
        console.error("Failed to redirect:", routerError);
        // Even if redirect fails, we should stop processing
        setStep("results");
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "Bir hata oluştu");
      setStep("recording");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async (notes: string) => {
    if (!consultationId) return;
    const consultation = await storage.get(consultationId);
    if (consultation) {
      consultation.doctorNotes = notes;
      consultation.updatedAt = new Date().toISOString();
      await storage.save(consultation);
      setAnalysis((prev) =>
        prev ? { ...prev, doctor_notes_draft: notes } : null
      );
    }
  };

  const handleSoapNoteChange = async (
    field:
      | "subjektiv"
      | "objektiv"
      | "beurteilungPlan"
      | "anamnese"
      | "untersuchung",
    value: string | undefined
  ) => {
    const updated = { ...soapNote };
    if (value === undefined) {
      // Alanı tamamen kaldır
      delete updated[field];
    } else {
      // Alanı ekle veya güncelle
      updated[field] = value;
    }
    setSoapNote(updated);
    if (consultationId) {
      const consultation = await storage.get(consultationId);
      if (consultation) {
        consultation.soapNote = updated;
        consultation.template = selectedTemplate;
        consultation.updatedAt = new Date().toISOString();
        await storage.save(consultation);
      }
    }
  };

  const handleAnamneseChange = async (
    field: "kontaktgrund" | "aktuellerZustand",
    value: string | undefined
  ) => {
    const updated = { ...anamnese };
    if (value === undefined) {
      // Alanı tamamen kaldır
      delete updated[field];
    } else {
      // Alanı ekle veya güncelle
      updated[field] = value;
    }
    setAnamnese(updated);
    if (consultationId) {
      const consultation = await storage.get(consultationId);
      if (consultation) {
        consultation.anamnese = updated;
        consultation.updatedAt = new Date().toISOString();
        await storage.save(consultation);
      }
    }
  };

  // Get full note content for copying
  const getNoteContent = (): string => {
    const parts: string[] = [];

    if (anamnese.kontaktgrund) {
      parts.push(`Kontaktgrund: ${anamnese.kontaktgrund}`);
    }
    if (anamnese.aktuellerZustand) {
      parts.push(`Aktueller Zustand: ${anamnese.aktuellerZustand}`);
    }

    // Template'e göre içerik ekle
    if (selectedTemplate === "kurzdokumentation") {
      if (soapNote.anamnese) {
        parts.push(`\nAnamnese:\n${soapNote.anamnese}`);
      }
      if (soapNote.untersuchung) {
        parts.push(`\nUntersuchung:\n${soapNote.untersuchung}`);
      }
    } else {
      // Dokumentation template
      if (soapNote.subjektiv) {
        parts.push(`\nSubjektiv:\n${soapNote.subjektiv}`);
      }
      if (soapNote.objektiv) {
        parts.push(`\nObjektiv:\n${soapNote.objektiv}`);
      }
    }

    if (soapNote.beurteilungPlan) {
      parts.push(`\nBeurteilung & Plan:\n${soapNote.beurteilungPlan}`);
    }

    return parts.join("\n");
  };

  const handleRegenerate = async () => {
    const noteContent = getNoteContent();
    if (!noteContent || noteContent.trim().length === 0) {
      showError("Regenerate için önce bir not içeriği olmalı.");
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch("/api/ai/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: noteContent }),
      });

      if (!response.ok) {
        throw new Error("Regenerate başarısız oldu");
      }

      const { regeneratedText } = await response.json();

      // Regenerated text'i SOAP note'un Beurteilung & Plan kısmına ekle
      const updatedSoapNote = {
        ...soapNote,
        beurteilungPlan: regeneratedText,
      };
      setSoapNote(updatedSoapNote);

      // Consultation'a kaydet
      if (consultationId) {
        const consultation = await storage.get(consultationId);
        if (consultation) {
          consultation.soapNote = updatedSoapNote;
          consultation.updatedAt = new Date().toISOString();
          await storage.save(consultation);
        }
      }

      showSuccess("Not başarıyla yeniden oluşturuldu!");
    } catch (error: any) {
      console.error("Regenerate error:", error);
      showError("Regenerate sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReanalyzeNote = async () => {
    if (!transcript || transcript.trim().length === 0) {
      showError(t("consultation.reanalyzeError") || "Transkript bulunamadı");
      return;
    }

    setIsReanalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-with-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript,
          template: selectedTemplate,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(t("consultation.reanalyzeError") || "Analiz başarısız oldu");
      }

      const { soapNote: newSoapNote } = await response.json();

      // Yeni SOAP note'u güncelle
      const updatedSoapNote = {
        subjektiv: newSoapNote.subjektiv || "",
        objektiv: newSoapNote.objektiv || "",
        beurteilungPlan: newSoapNote.beurteilungPlan || "",
        anamnese: newSoapNote.anamnese || "",
        untersuchung: newSoapNote.untersuchung || "",
      };

      const updatedAnamnese = {
        kontaktgrund: newSoapNote.kontaktgrund || "",
        aktuellerZustand: newSoapNote.aktueller_zustand || newSoapNote.aktuellerZustand || "",
      };

      setSoapNote(updatedSoapNote);
      setAnamnese(updatedAnamnese);

      // Consultation'a kaydet
      if (consultationId) {
        const consultation = await storage.get(consultationId);
        if (consultation) {
          consultation.soapNote = updatedSoapNote;
          consultation.anamnese = updatedAnamnese;
          consultation.updatedAt = new Date().toISOString();
          await storage.save(consultation);
        }
      }

      showSuccess(t("consultation.reanalyzeSuccess") || "Not başarıyla güncellendi!");
    } catch (error: any) {
      console.error("Reanalyze error:", error);
      showError((t("consultation.reanalyzeError") || "Analiz sırasında bir hata oluştu") + ": " + error.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleTemplateChange = async (newTemplate: string) => {
    // Eğer template değişiyorsa, mevcut not içeriğini yeni template'e göre yeniden yaz
    if (newTemplate !== selectedTemplate) {
      setIsTemplateChanging(true);
      setIsRegenerating(true);
      try {
        // Mevcut not içeriğini al (Anamnese + SOAP Note)
        const currentNoteContent = getNoteContent();

        // Eğer mevcut içerik yoksa ve transcript varsa, transcript'i kullan
        const sourceContent =
          currentNoteContent && currentNoteContent.trim().length > 0
            ? currentNoteContent
            : transcript || "";

        if (!sourceContent || sourceContent.trim().length === 0) {
          // İçerik yoksa sadece template'i değiştir
          setSelectedTemplate(newTemplate);
          if (consultationId) {
            const consultation = await storage.get(consultationId);
            if (consultation) {
              consultation.template = newTemplate;
              consultation.updatedAt = new Date().toISOString();
              await storage.save(consultation);
            }
          }
          setIsRegenerating(false);
          return;
        }

        const response = await fetch("/api/ai/analyze-with-template", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: transcript || "",
            template: newTemplate,
            existingNote: currentNoteContent, // Mevcut not içeriğini gönder
          }),
        });

        if (!response.ok) {
          throw new Error("Template analizi başarısız oldu");
        }

        const { soapNote: newSoapNote } = await response.json();

        // Yeni template'e göre SOAP note'u tamamen değiştir (merge değil, replace)
        // Eski template'in field'larını temizle, yeni template'in field'larını kullan
        const updatedSoapNote: any = {};

        if (newTemplate === "kurzdokumentation") {
          // Kurzdokumentation template: anamnese, untersuchung, beurteilungPlan
          updatedSoapNote.anamnese = newSoapNote.anamnese || "";
          updatedSoapNote.untersuchung = newSoapNote.untersuchung || "";
          updatedSoapNote.beurteilungPlan = newSoapNote.beurteilungPlan || "";
          // Eski template field'larını temizle
          updatedSoapNote.subjektiv = undefined;
          updatedSoapNote.objektiv = undefined;
        } else {
          // Dokumentation template: subjektiv, objektiv, beurteilungPlan
          updatedSoapNote.subjektiv = newSoapNote.subjektiv || "";
          updatedSoapNote.objektiv = newSoapNote.objektiv || "";
          updatedSoapNote.beurteilungPlan = newSoapNote.beurteilungPlan || "";
          // Eski template field'larını temizle
          updatedSoapNote.anamnese = undefined;
          updatedSoapNote.untersuchung = undefined;
        }

        setSoapNote(updatedSoapNote);

        // Consultation'a kaydet
        if (consultationId) {
          const consultation = await storage.get(consultationId);
          if (consultation) {
            consultation.soapNote = updatedSoapNote;
            consultation.template = newTemplate;
            consultation.updatedAt = new Date().toISOString();
            await storage.save(consultation);
          }
        }
      } catch (error: any) {
        console.error("Template change error:", error);
        showError("Template değiştirilirken bir hata oluştu: " + error.message);
      } finally {
        setIsTemplateChanging(false);
        setIsRegenerating(false);
      }
    }

    setSelectedTemplate(newTemplate);

    // Template değiştiğinde consultation'a kaydet
    if (consultationId) {
      const consultation = await storage.get(consultationId);
      if (consultation) {
        consultation.template = newTemplate;
        consultation.updatedAt = new Date().toISOString();
        await storage.save(consultation);
      }
    }
  };

  const handleAddEntry = () => {
    // Add entry - Note tab'ına geç ve Add or adjust modal'ını aç
    setActiveTab("note");
    setIsAddOrAdjustOpen(true);
    // Target belirtme, kullanıcı hangi alana eklemek istediğini seçebilir
  };

  const handleAddOrAdjust = () => {
    // Kullanıcıya hangi field'a eklemek istediğini sor
    // Şimdilik aktif tab'ı Note'a geçir ve modal'ı aç
    setActiveTab("note");
    // Modal'ı aç ama target belirtme, kullanıcı seçsin
    setIsAddOrAdjustOpen(true);
  };

  const handleAddOrAdjustConfirm = (
    text: string,
    action: "add" | "replace" = "add"
  ) => {
    if (!text || !text.trim()) {
      return;
    }

    if (addOrAdjustTarget.type) {
      if (
        addOrAdjustTarget.type === "subjektiv" ||
        addOrAdjustTarget.type === "objektiv" ||
        addOrAdjustTarget.type === "beurteilungPlan" ||
        addOrAdjustTarget.type === "anamnese" ||
        addOrAdjustTarget.type === "untersuchung"
      ) {
        // Mevcut değeri state'ten al
        let currentValue = "";
        if (addOrAdjustTarget.type === "subjektiv") {
          currentValue = soapNote.subjektiv || "";
        } else if (addOrAdjustTarget.type === "objektiv") {
          currentValue = soapNote.objektiv || "";
        } else if (addOrAdjustTarget.type === "beurteilungPlan") {
          currentValue = soapNote.beurteilungPlan || "";
        } else if (addOrAdjustTarget.type === "anamnese") {
          currentValue = soapNote.anamnese || "";
        } else if (addOrAdjustTarget.type === "untersuchung") {
          currentValue = soapNote.untersuchung || "";
        }

        const finalText =
          action === "add" && currentValue
            ? `${currentValue}\n${text.trim()}`
            : text.trim();
        handleSoapNoteChange(addOrAdjustTarget.type, finalText);
      } else if (
        addOrAdjustTarget.type === "kontaktgrund" ||
        addOrAdjustTarget.type === "aktuellerZustand"
      ) {
        // Mevcut değeri state'ten al
        let currentValue = "";
        if (addOrAdjustTarget.type === "kontaktgrund") {
          currentValue = anamnese.kontaktgrund || "";
        } else if (addOrAdjustTarget.type === "aktuellerZustand") {
          currentValue = anamnese.aktuellerZustand || "";
        }

        const finalText =
          action === "add" && currentValue
            ? `${currentValue}\n${text.trim()}`
            : text.trim();
        handleAnamneseChange(addOrAdjustTarget.type, finalText);
      }
    } else {
      // Eğer target belirtilmemişse, Beurteilung & Plan'a ekle
      const currentPlan = soapNote.beurteilungPlan || "";
      const finalText =
        action === "add" && currentPlan
          ? `${currentPlan}\n${text.trim()}`
          : text.trim();
      handleSoapNoteChange("beurteilungPlan", finalText);
    }
    setIsAddOrAdjustOpen(false);
    setAddOrAdjustTarget({ type: null });
  };

  const handleCopyNote = () => {
    const content = getNoteContent();
    if (content) {
      navigator.clipboard.writeText(content);
      showSuccess("Not kopyalandı!");
    } else {
      showError("Kopyalanacak not içeriği bulunamadı.");
    }
  };

  const handleStatusChange = async (newStatus: typeof status) => {
    setStatus(newStatus);
    if (consultationId) {
      const consultation = await storage.get(consultationId);
      if (consultation) {
        consultation.status = newStatus;
        consultation.updatedAt = new Date().toISOString();
        await storage.save(consultation);
      }
    }
  };

  const handleApprove = async () => {
    if (!consultationId) return;
    const consultation = await storage.get(consultationId);
    if (consultation) {
      consultation.status = "approved";
      consultation.updatedAt = new Date().toISOString();
      await storage.save(consultation);
      router.push("/dashboard");
    }
  };

  const handleReject = async () => {
    if (!consultationId) return;
    const consultation = await storage.get(consultationId);
    if (consultation) {
      consultation.status = "rejected";
      consultation.updatedAt = new Date().toISOString();
      await storage.save(consultation);
      router.push("/dashboard");
    }
  };

  const handleReanalyze = async () => {
    if (!transcript) return;
    setIsProcessing(true);
    setError(null);

    try {
      const analyzeResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Yeniden analiz yapılamadı");
      }

      const { analysis: newAnalysis } = await analyzeResponse.json();
      setAnalysis(newAnalysis);

      if (consultationId) {
        const consultation = await storage.get(consultationId);
        if (consultation) {
          consultation.analysis = newAnalysis;
          consultation.doctorNotes = newAnalysis.doctor_notes_draft;
          consultation.updatedAt = new Date().toISOString();
          await storage.save(consultation);
        }
      }
    } catch (err: any) {
      console.error("Reanalysis error:", err);
      setError(err.message || "Yeniden analiz yapılamadı");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setTranscript("");
    setConversation([]);
    setAnalysis(null);
    setStep("recording");
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
    setConsultationId("");
    setActiveTab("transcription");
    // Show cancellation message
    setError(t("recording.cancelled") || "Kayıt iptal edildi");
    // Clear error message after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  const tabs = useMemo(
    () => [
      {
        id: "transcription",
        label: t("consultation.transcription"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: "note",
        label: t("consultation.note"),
        icon: <MessageSquare className="w-4 h-4" />,
      },
    ],
    [t]
  );

  return (
    <ProtectedRoute requiredRole="doctor">
      <MainLayout>
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <StatusBadge
                status={status}
                onStatusChange={handleStatusChange}
                editable={step === "results"}
              />
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-theme-text-secondary"
                }`}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {isEditingPatientName ? (
              <input
                ref={patientNameInputRef}
                type="text"
                value={editedPatientName}
                onChange={(e) => setEditedPatientName(e.target.value)}
                onBlur={handlePatientNameBlur}
                onKeyDown={handlePatientNameKeyDown}
                className={`text-2xl font-bold mb-1 bg-transparent border-b-2 border-theme-primary focus:outline-none focus:border-theme-primary-dark w-full ${
                  isDark ? "text-white" : "text-theme-text"
                }`}
                placeholder={t("dashboard.newConsultation")}
              />
            ) : (
              <h1
                onClick={handlePatientNameClick}
                className={`text-2xl font-bold mb-1 cursor-pointer hover:text-theme-primary transition-colors ${
                  isDark ? "text-white" : "text-theme-text"
                }`}>
                {patientName.trim() || t("dashboard.newConsultation")}
              </h1>
            )}
          </div>

          {error && (
            <div
              className={`mb-6 p-4 border rounded-lg ${
                isDark
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
              {error}
            </div>
          )}

          {step === "recording" && (
            <div className="bg-theme-gray-bg rounded-lg shadow-sm border border-theme-border p-6">
              <div className="flex flex-col items-center justify-center py-12">
                <RecordingButton
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingStart={handleRecordingStart}
                  onReset={handleReset}
                  disabled={isProcessing}
                />
                <p
                  className={`mt-6 text-center max-w-md text-sm ${
                    isDark
                      ? "text-theme-text-secondary"
                      : "text-theme-text-secondary"
                  }`}>
                  {t("consultation.startRecordingHint") ||
                    "Yeni bir konsültasyon başlatmak için kayıt butonuna dokunun"}
                </p>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="bg-theme-card rounded-lg shadow-sm border border-theme-border p-8">
              <div className="flex flex-col items-center justify-center min-h-[500px]">
                <Loader2
                  className={`w-16 h-16 animate-spin mb-4 text-theme-success`}
                />
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    isDark ? "text-white" : "text-theme-text"
                  }`}>
                  {t("consultation.analyzing")}
                </h2>
                <p
                  className={`text-center max-w-md ${
                    isDark ? "text-gray-300" : "text-theme-text-secondary"
                  }`}>
                  {t("consultation.analyzingDescription")}
                  <br />
                  {t("consultation.analyzingNote")}
                </p>
              </div>
            </div>
          )}

          {step === "results" && analysis && (
            <div className="bg-theme-card rounded-lg shadow-sm border border-theme-border">
              {/* Tabs */}
              <div className="px-6 pt-6">
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={(tabId) => {
                    setActiveTab(tabId as "transcription" | "note");
                  }}
                />
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "transcription" && (
                  <TranscriptDisplay
                    conversation={conversation}
                    rawTranscript={transcript}
                  />
                )}

                {activeTab === "note" && (
                  <div className="space-y-6">
                    {/* Reanalyze Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleReanalyzeNote}
                        disabled={isReanalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isReanalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t("consultation.reanalyzing") || "Analiz ediliyor..."}</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>{t("consultation.reanalyze") || "Güncelle"}</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Anamnese Section */}
                    <AnamneseSection
                      kontaktgrund={anamnese.kontaktgrund}
                      aktuellerZustand={anamnese.aktuellerZustand}
                      onKontaktgrundChange={(value: string) =>
                        handleAnamneseChange("kontaktgrund", value)
                      }
                      onAktuellerZustandChange={(value: string) =>
                        handleAnamneseChange("aktuellerZustand", value)
                      }
                      onKontaktgrundDelete={() =>
                        handleAnamneseChange("kontaktgrund", undefined)
                      }
                      onAktuellerZustandDelete={() =>
                        handleAnamneseChange("aktuellerZustand", undefined)
                      }
                      onKontaktgrundAdd={() =>
                        handleAnamneseChange("kontaktgrund", "")
                      }
                      onAktuellerZustandAdd={() =>
                        handleAnamneseChange("aktuellerZustand", "")
                      }
                      editable={true}
                    />

                    {/* SOAP Note Section */}
                    <SOAPNote
                      subjektiv={soapNote.subjektiv}
                      objektiv={soapNote.objektiv}
                      beurteilungPlan={soapNote.beurteilungPlan}
                      anamnese={soapNote.anamnese}
                      untersuchung={soapNote.untersuchung}
                      onSubjektivChange={(value: string) =>
                        handleSoapNoteChange("subjektiv", value)
                      }
                      onObjektivChange={(value: string) =>
                        handleSoapNoteChange("objektiv", value)
                      }
                      onBeurteilungPlanChange={(value: string) =>
                        handleSoapNoteChange("beurteilungPlan", value)
                      }
                      onAnamneseChange={(value: string) =>
                        handleSoapNoteChange("anamnese", value)
                      }
                      onUntersuchungChange={(value: string) =>
                        handleSoapNoteChange("untersuchung", value)
                      }
                      onSubjektivDelete={() =>
                        handleSoapNoteChange("subjektiv", undefined)
                      }
                      onObjektivDelete={() =>
                        handleSoapNoteChange("objektiv", undefined)
                      }
                      onBeurteilungPlanDelete={() =>
                        handleSoapNoteChange("beurteilungPlan", undefined)
                      }
                      onAnamneseDelete={() =>
                        handleSoapNoteChange("anamnese", undefined)
                      }
                      onUntersuchungDelete={() =>
                        handleSoapNoteChange("untersuchung", undefined)
                      }
                      onSubjektivAdd={() =>
                        handleSoapNoteChange("subjektiv", "")
                      }
                      onObjektivAdd={() => handleSoapNoteChange("objektiv", "")}
                      onBeurteilungPlanAdd={() =>
                        handleSoapNoteChange("beurteilungPlan", "")
                      }
                      onAnamneseAdd={() => handleSoapNoteChange("anamnese", "")}
                      onUntersuchungAdd={() =>
                        handleSoapNoteChange("untersuchung", "")
                      }
                      editable={true}
                      template={
                        selectedTemplate as
                          | "dokumentation"
                          | "kurzdokumentation"
                          | "standard"
                      }
                      onAddOrAdjust={(field, currentText) => {
                        setAddOrAdjustTarget({ type: field, currentText });
                        setIsAddOrAdjustOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add or Adjust Modal */}
          <AddOrAdjustModal
            isOpen={isAddOrAdjustOpen}
            onClose={() => {
              setIsAddOrAdjustOpen(false);
              setAddOrAdjustTarget({ type: null });
            }}
            onAdd={handleAddOrAdjustConfirm}
            currentText={addOrAdjustTarget.currentText || ""}
            fieldLabel={addOrAdjustTarget.type || "Not"}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
