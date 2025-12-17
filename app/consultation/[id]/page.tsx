"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { storage, Consultation } from "@/lib/storage";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import Tabs from "@/components/Tabs";
import { FileText, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import SOAPNote from "@/components/SOAPNote";
import AddOrAdjustModal from "@/components/AddOrAdjustModal";
import DocumentGenerator from "@/components/DocumentGenerator";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SavedDocument } from "@/lib/storage";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { useAuth } from "@/lib/AuthContext";

export default function ConsultationDetailPage() {
  const { language, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth(); // Get user from AuthContext to avoid getUser() calls
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  console.log(
    "🔄 [ConsultationDetailPage] RENDER - ID:",
    id,
    "| Consultation:",
    consultation?.id || "null"
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Keep previous consultation to show during transition
  const previousConsultationRef = useRef<Consultation | null>(null);
  const [conversation, setConversation] = useState<
    Array<{ speaker: "Doktor" | "Hasta"; text: string }>
  >([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "transcription"
    | "note"
    | "patientMessage"
    | "referralReason"
    | "referralResponse"
  >("transcription");
  const [showCreateDocDropdown, setShowCreateDocDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isEditingPatientName, setIsEditingPatientName] = useState(false);
  const [editedPatientName, setEditedPatientName] = useState("");
  const patientNameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCreateDocDropdown(false);
      }
    };

    if (showCreateDocDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCreateDocDropdown]);
  // Sadece display için state (ilk yükleme ve template değişikliği için)
  const [soapNote, setSoapNote] = useState<{
    subjektiv?: string;
    objektiv?: string;
    beurteilungPlan?: string;
    anamnese?: string;
    untersuchung?: string;
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
      | "aktueller_zustand"
      | null;
    currentText?: string;
  }>({ type: null });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isTemplateChanging, setIsTemplateChanging] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Ref'ler - sadece güncel değerleri tutmak için
  const soapNoteRef = useRef(soapNote);

  // State değiştiğinde ref'leri güncelle (sadece template change gibi durumlar için)
  useEffect(() => {
    // Sadece state değiştiğinde ref'i güncelle (template change gibi durumlar için)
    if (soapNote !== soapNoteRef.current) {
      soapNoteRef.current = soapNote;
    }
  }, [soapNote]);

  // Track previous ID to detect when consultation changes
  const prevIdRef = useRef<string | null>(null);

  // Memoize tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(
      tabId as
        | "transcription"
        | "note"
        | "patientMessage"
        | "referralReason"
        | "referralResponse"
    );
  }, []);

  useEffect(() => {
    // Early return if ID hasn't changed (prevents unnecessary re-runs)
    if (prevIdRef.current === id) {
      return;
    }

    const loadConsultation = async () => {
      // If ID changed, this is a new consultation (first load)
      // If ID is the same, this is a refresh (keep showing old data)
      const previousId = prevIdRef.current;
      const isFirstLoad = previousId !== id;
      const wasFirstLoad = previousId === null;
      console.log(
        "🔄 [ConsultationDetailPage] useEffect - ID changed:",
        previousId,
        "->",
        id,
        "| isFirstLoad:",
        isFirstLoad,
        "| wasFirstLoad:",
        wasFirstLoad
      );
      prevIdRef.current = id;

      if (isFirstLoad) {
        // Only show loading on very first load (when there's no consultation at all)
        if (wasFirstLoad) {
          setIsInitialLoading(true);
        } else {
          // Switching consultations - keep old data visible, just show subtle refresh indicator
          setIsRefreshing(true);
          // Save current consultation as previous to show during transition
          if (consultation) {
            previousConsultationRef.current = consultation;
          }
          // Clear conversation when switching consultations to prevent stale data
          setConversation([]);
        }
        // DON'T clear old consultation - keep it visible while loading new one
        // setConsultation(null); // REMOVED - keep old consultation visible
      } else {
        // Don't refresh if ID hasn't changed - just return
        // This prevents unnecessary API calls when component re-renders
        return;
      }

      try {
        // Pass userId to avoid redundant getUser() call in storage.get()
        const data = await storage.get(id, user?.id);
        if (!data) {
          console.warn("Consultation not found");
          // Only redirect on first load, not on refresh
          if (wasFirstLoad) {
            router.push("/dashboard");
          } else {
            // On refresh, keep old consultation but show error toast
            showError(t("consultation.notFound"));
            setIsRefreshing(false);
          }
          return;
        }
        // Update consultation - this will trigger re-render of only affected components
        console.log(
          "✅ [ConsultationDetailPage] Consultation loaded - ID:",
          data.id,
          "| Status:",
          data.status,
          "| Has transcript:",
          !!data.transcript
        );
        setConsultation(data);
        setEditedNotes(data.doctorNotes || "");
        // Clear previous consultation ref after successful load
        previousConsultationRef.current = null;

        // SOAP Note ve Anamnese state'lerini yükle
        if (data.soapNote) {
          soapNoteRef.current = data.soapNote;
          setSoapNote(data.soapNote);
        }

        // Load conversation - only if not already loaded
        if (data.conversation) {
          setConversation(data.conversation);
        } else if (data.transcript) {
          // Only auto-generate conversation on first load, not on refresh
          // This prevents unnecessary API calls when switching consultations
          if (isFirstLoad) {
            setIsLoadingConversation(true);
            fetch("/api/ai/identify-speakers", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ transcript: data.transcript }),
            })
              .then((res) => {
                if (res.ok) {
                  return res.json();
                }
                throw new Error("Speaker identification failed");
              })
              .then(async ({ conversation: newConversation }) => {
                if (newConversation && newConversation.length > 0) {
                  setConversation(newConversation);
                  // Conversation'ı consultation'a kaydet
                  const updated = {
                    ...data,
                    conversation: newConversation,
                    updatedAt: new Date().toISOString(),
                  };
                  await storage.save(updated);
                  setConsultation(updated);
                }
              })
              .catch((err) => {
                console.error("Failed to identify speakers:", err);
                // Hata durumunda boş conversation ile devam et
                setConversation([]);
              })
              .finally(() => {
                setIsLoadingConversation(false);
              });
          } else {
            // On refresh, just set empty conversation
            setConversation([]);
          }
        } else {
          setConversation([]);
        }
        if (data.template) {
          setSelectedTemplate(data.template);
        }

        // Eğer consultation yeni oluşturulmuşsa (son 30 saniye içinde) otomatik olarak "note" tab'ına geç
        const consultationDate = new Date(data.createdAt).getTime();
        const now = new Date().getTime();
        const timeDiff = now - consultationDate;
        const thirtySeconds = 30 * 1000; // 30 saniye

        if (timeDiff < thirtySeconds && data.transcript) {
          // Yeni oluşturulmuş ve transcript varsa (ses kaydı tamamlanmış demektir)
          setActiveTab("note");
        }
      } catch (error) {
        console.error("Error loading consultation:", error);
        // Only redirect on first load, not on refresh
        if (isFirstLoad) {
          router.push("/dashboard");
        } else {
          showError(t("consultation.loadError"));
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    };
    loadConsultation();
  }, [id]); // Only depend on id - user?.id is stable and checked inside

  useEffect(() => {
    if (isEditingPatientName && patientNameInputRef.current) {
      patientNameInputRef.current.focus();
      patientNameInputRef.current.select();
    }
  }, [isEditingPatientName]);

  const handleEdit = useCallback(
    async (notes: string) => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;
      const updated = {
        ...currentConsultation,
        doctorNotes: notes,
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);
    },
    [consultation?.id] // Only depend on ID
  );

  const handleStatusChange = useCallback(
    async (
      newStatus:
        | "not_transferred"
        | "transferred"
        | "completed"
        | "draft"
        | "approved"
        | "rejected"
    ) => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;
      const updated = {
        ...currentConsultation,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);

      // Notify sidebar to refresh consultation list
      // This ensures sidebar shows updated status
      window.dispatchEvent(
        new CustomEvent("consultation-updated", {
          detail: { consultationId: currentConsultation.id, status: newStatus },
        })
      );
    },
    [consultation?.id] // Only depend on ID, not entire consultation object
  );

  const handleDeleteConsultation = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;

    try {
      await storage.delete(currentConsultation.id);

      // Sonraki görüşmeyi bul
      const allConsultations = await storage.getAll();
      // Tarihe göre sırala (en yeni en üstte)
      const sortedConsultations = allConsultations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (sortedConsultations.length > 0) {
        // En son görüşmeye git
        router.push(`/consultation/${sortedConsultations[0].id}`);
      } else {
        // Hiç görüşme kalmadıysa yeni görüşme sayfasına git
        router.push("/new-consultation");
      }
    } catch (error) {
      console.error("Error deleting consultation:", error);
      showError(t("consultation.deleteError"));
    }

    setIsDeleteDialogOpen(false);
  };

  // Sadece ref'i güncelle - manuel save yapılacak
  const handleSoapNoteChange = (
    field:
      | "subjektiv"
      | "objektiv"
      | "beurteilungPlan"
      | "anamnese"
      | "untersuchung",
    value: string
  ) => {
    // Ref'i güncelle
    soapNoteRef.current = {
      ...soapNoteRef.current,
      [field]: value,
    };
    // State'i de güncelle (ekranda görünmesi için)
    setSoapNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Delete işlemi için ayrı fonksiyon
  const handleSoapNoteDelete = (
    field:
      | "subjektiv"
      | "objektiv"
      | "beurteilungPlan"
      | "anamnese"
      | "untersuchung"
  ) => {
    const copy = { ...soapNoteRef.current };
    delete copy[field];
    soapNoteRef.current = copy;
  };

  // Add işlemi için ayrı fonksiyon
  const handleSoapNoteAdd = (
    field:
      | "subjektiv"
      | "objektiv"
      | "beurteilungPlan"
      | "anamnese"
      | "untersuchung"
  ) => {
    soapNoteRef.current = {
      ...soapNoteRef.current,
      [field]: "",
    };
  };

  // Anamnese field handlers
  const handleAnamneseChange = useCallback(
    async (field: "kontaktgrund" | "aktueller_zustand", value: string) => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;
      const updated = {
        ...currentConsultation,
        anamnese: {
          ...currentConsultation.anamnese,
          [field]: value,
        },
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);
    },
    [consultation]
  );

  const handleAnamneseDelete = useCallback(
    async (field: "kontaktgrund" | "aktueller_zustand") => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;
      const updated = {
        ...currentConsultation,
        anamnese: {
          ...currentConsultation.anamnese,
          [field]: undefined,
        },
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);
    },
    [consultation]
  );

  const handleAnamneseAdd = useCallback(
    (field: "kontaktgrund" | "aktueller_zustand") => {
      // Just trigger the add modal - actual add is handled by handleAddOrAdjustConfirm
      setAddOrAdjustTarget({ type: field });
      setIsAddOrAdjustOpen(true);
    },
    []
  );

  const handleTemplateChange = async (newTemplate: string) => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;

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
            : currentConsultation.transcript || "";

        if (!sourceContent || sourceContent.trim().length === 0) {
          // İçerik yoksa sadece template'i değiştir
          setSelectedTemplate(newTemplate);
          // Autosave useEffect'i kaydedecek, burada manuel kaydetmeye gerek yok
          setIsRegenerating(false);
          return;
        }

        const response = await fetch("/api/ai/analyze-with-template", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: currentConsultation.transcript || "",
            template: newTemplate,
            existingNote: currentNoteContent, // Mevcut not içeriğini gönder
            language,
          }),
        });

        if (!response.ok) {
          throw new Error(t("consultation.templateAnalysisFailed"));
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

        soapNoteRef.current = updatedSoapNote;
        setSoapNote(updatedSoapNote);
        setSelectedTemplate(newTemplate);
        // Autosave useEffect'i kaydedecek, burada manuel kaydetmeye gerek yok
      } catch (error: any) {
        console.error("Template change error:", error);
        showError(t("consultation.templateChangeError") + ": " + error.message);
      } finally {
        setIsTemplateChanging(false);
        setIsRegenerating(false);
      }
    } else {
      // Template aynıysa sadece state'i güncelle
      setSelectedTemplate(newTemplate);
      // Autosave useEffect'i kaydedecek
    }
  };

  const getNoteContent = (): string => {
    const parts: string[] = [];
    const currentSoapNote = soapNoteRef.current; // Ref'ten al
    const currentConsultation = consultation || previousConsultationRef.current;

    if (currentConsultation?.anamnese?.kontaktgrund) {
      parts.push(`Kontaktgrund: ${currentConsultation.anamnese.kontaktgrund}`);
    }
    if (currentConsultation?.anamnese?.aktueller_zustand) {
      parts.push(
        `Aktueller Zustand: ${currentConsultation.anamnese.aktueller_zustand}`
      );
    }
    if (currentSoapNote.subjektiv) {
      parts.push(`\nSubjektiv:\n${currentSoapNote.subjektiv}`);
    }
    if (currentSoapNote.objektiv) {
      parts.push(`\nObjektiv:\n${currentSoapNote.objektiv}`);
    }
    if (currentSoapNote.beurteilungPlan) {
      parts.push(`\nBeurteilung & Plan:\n${currentSoapNote.beurteilungPlan}`);
    }

    return parts.join("\n");
  };

  const handleRegenerate = async () => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;
    const noteContent = getNoteContent();
    if (!noteContent || noteContent.trim().length === 0) {
      showError(t("consultation.regenerateError"));
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
        throw new Error(t("consultation.regenerateFailed"));
      }

      const { regeneratedText } = await response.json();

      // Regenerated text'i SOAP note'un Beurteilung & Plan kısmına ekle
      soapNoteRef.current = {
        ...soapNoteRef.current,
        beurteilungPlan: regeneratedText,
      };
      setSoapNote(soapNoteRef.current); // Display için state güncelle
      // Autosave useEffect'i kaydedecek

      showSuccess(t("consultation.regenerateSuccess"));
    } catch (error: any) {
      console.error("Regenerate error:", error);
      showError(
        t("consultation.regenerateErrorOccurred") + ": " + error.message
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReanalyze = async () => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation || !currentConsultation.transcript) {
      showError(t("consultation.transcriptNotFound"));
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
          transcript: currentConsultation.transcript,
          template: selectedTemplate,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(t("consultation.analysisFailed"));
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
        aktueller_zustand:
          newSoapNote.aktueller_zustand || newSoapNote.aktuellerZustand || "",
      };

      soapNoteRef.current = updatedSoapNote;
      setSoapNote(updatedSoapNote);

      // Consultation'ı güncelle
      const updated = {
        ...currentConsultation,
        soapNote: updatedSoapNote,
        anamnese: updatedAnamnese,
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);

      showSuccess(t("consultation.reanalyzeSuccess"));
    } catch (error: any) {
      console.error("Reanalyze error:", error);
      showError(t("consultation.reanalyzeError") + ": " + error.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleAddEntry = () => {
    // Note tab'ına geç ve Add or adjust modal'ını aç
    setActiveTab("note");
    setIsAddOrAdjustOpen(true);
    // Target belirtme, kullanıcı hangi alana eklemek istediğini seçebilir
  };

  const handleAddOrAdjust = () => {
    setActiveTab("note");

    // Eğer target belirtilmemişse, Beurteilung & Plan'ı hedefle
    if (!addOrAdjustTarget.type) {
      const currentPlan = soapNoteRef.current.beurteilungPlan || "";
      setAddOrAdjustTarget({
        type: "beurteilungPlan",
        currentText: currentPlan,
      });
    } else {
      // Mevcut target'ın currentText'ini güncelle
      let currentValue = "";
      if (
        addOrAdjustTarget.type === "subjektiv" ||
        addOrAdjustTarget.type === "objektiv" ||
        addOrAdjustTarget.type === "beurteilungPlan" ||
        addOrAdjustTarget.type === "anamnese" ||
        addOrAdjustTarget.type === "untersuchung"
      ) {
        const currentSoapNote = soapNoteRef.current;
        if (addOrAdjustTarget.type === "subjektiv") {
          currentValue = currentSoapNote.subjektiv || "";
        } else if (addOrAdjustTarget.type === "objektiv") {
          currentValue = currentSoapNote.objektiv || "";
        } else if (addOrAdjustTarget.type === "beurteilungPlan") {
          currentValue = currentSoapNote.beurteilungPlan || "";
        } else if (addOrAdjustTarget.type === "anamnese") {
          currentValue = currentSoapNote.anamnese || "";
        } else if (addOrAdjustTarget.type === "untersuchung") {
          currentValue = currentSoapNote.untersuchung || "";
        }
      } else if (
        addOrAdjustTarget.type === "kontaktgrund" ||
        addOrAdjustTarget.type === "aktueller_zustand"
      ) {
        const currentConsultation =
          consultation || previousConsultationRef.current;
        if (addOrAdjustTarget.type === "kontaktgrund") {
          currentValue = currentConsultation?.anamnese?.kontaktgrund || "";
        } else if (addOrAdjustTarget.type === "aktueller_zustand") {
          currentValue = currentConsultation?.anamnese?.aktueller_zustand || "";
        }
      }

      setAddOrAdjustTarget({
        ...addOrAdjustTarget,
        currentText: currentValue,
      });
    }

    setIsAddOrAdjustOpen(true);
  };

  const handleAddOrAdjustConfirm = (
    text: string,
    action: "add" | "replace" = "add"
  ) => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!text || !text.trim() || !currentConsultation) {
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
        const type = addOrAdjustTarget.type; // Store in const for type narrowing
        let currentValue = "";
        const currentSoapNote = soapNoteRef.current; // Ref'ten al
        if (type === "subjektiv") {
          currentValue = currentSoapNote.subjektiv || "";
        } else if (type === "objektiv") {
          currentValue = currentSoapNote.objektiv || "";
        } else if (type === "beurteilungPlan") {
          currentValue = currentSoapNote.beurteilungPlan || "";
        } else if (type === "anamnese") {
          currentValue = currentSoapNote.anamnese || "";
        } else if (type === "untersuchung") {
          currentValue = currentSoapNote.untersuchung || "";
        }

        let finalText = "";
        if (action === "add" && currentValue) {
          // Mevcut metne ekle
          finalText = `${currentValue}\n${text.trim()}`;
        } else if (action === "replace") {
          // Mevcut metni değiştir
          finalText = text.trim();
        } else {
          // Add ama currentValue boş, direkt ekle
          finalText = text.trim();
        }
        handleSoapNoteChange(type, finalText);
        // State'i de güncelle (ekranda görünmesi için)
        setSoapNote((prev) => ({
          ...prev,
          [type]: finalText,
        }));
      } else if (
        addOrAdjustTarget.type === "kontaktgrund" ||
        addOrAdjustTarget.type === "aktueller_zustand"
      ) {
        let currentValue = "";
        const currentConsultation =
          consultation || previousConsultationRef.current;
        if (addOrAdjustTarget.type === "kontaktgrund") {
          currentValue = currentConsultation?.anamnese?.kontaktgrund || "";
        } else if (addOrAdjustTarget.type === "aktueller_zustand") {
          currentValue = currentConsultation?.anamnese?.aktueller_zustand || "";
        }

        let finalText = "";
        if (action === "add" && currentValue) {
          // Mevcut metne ekle
          finalText = `${currentValue}\n${text.trim()}`;
        } else if (action === "replace") {
          // Mevcut metni değiştir
          finalText = text.trim();
        } else {
          // Add ama currentValue boş, direkt ekle
          finalText = text.trim();
        }
        handleAnamneseChange(addOrAdjustTarget.type, finalText);
      }
    } else {
      // Eğer target belirtilmemişse, Beurteilung & Plan'a ekle
      const currentPlan = soapNoteRef.current.beurteilungPlan || "";
      let finalText = "";
      if (action === "add" && currentPlan) {
        // Mevcut metne ekle
        finalText = `${currentPlan}\n${text.trim()}`;
      } else if (action === "replace") {
        // Mevcut metni değiştir
        finalText = text.trim();
      } else {
        // Add ama currentPlan boş, direkt ekle
        finalText = text.trim();
      }
      handleSoapNoteChange("beurteilungPlan", finalText);
    }
    setIsAddOrAdjustOpen(false);
    setAddOrAdjustTarget({ type: null });
  };

  const handleCopyNote = () => {
    const content = getNoteContent();
    if (content) {
      navigator.clipboard.writeText(content);
      showSuccess(t("consultation.copyNote") + "!");
    } else {
      showError(t("consultation.noNoteContentToCopy"));
    }
  };

  const handleApprove = async () => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;
    const updated = {
      ...currentConsultation,
      status: "approved" as const,
      updatedAt: new Date().toISOString(),
    };
    await storage.save(updated);
    setConsultation(updated);
    router.push("/dashboard");
  };

  const handleReject = async () => {
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;
    const updated = {
      ...currentConsultation,
      status: "rejected" as const,
      updatedAt: new Date().toISOString(),
    };
    await storage.save(updated);
    setConsultation(updated);
    router.push("/dashboard");
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Memoize handlers that depend on consultation
  const handleSaveDocument = useCallback(
    async (document: SavedDocument) => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;

      const existingDocuments = Array.isArray(currentConsultation.documents)
        ? currentConsultation.documents
        : [];
      const existingIndex = existingDocuments.findIndex(
        (d) => d.id === document.id
      );

      let updatedDocuments: SavedDocument[];
      if (existingIndex >= 0) {
        // Update existing
        updatedDocuments = [...existingDocuments];
        updatedDocuments[existingIndex] = document;
      } else {
        // Add new
        updatedDocuments = [...existingDocuments, document];
      }

      const updated = {
        ...currentConsultation,
        documents: updatedDocuments,
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);
    },
    [consultation]
  );

  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      const currentConsultation =
        consultation || previousConsultationRef.current;
      if (!currentConsultation) return;

      const existingDocuments = Array.isArray(currentConsultation.documents)
        ? currentConsultation.documents
        : [];
      const updatedDocuments = existingDocuments.filter(
        (d) => d.id !== documentId
      );

      const updated = {
        ...currentConsultation,
        documents: updatedDocuments,
        updatedAt: new Date().toISOString(),
      };
      await storage.save(updated);
      setConsultation(updated);
    },
    [consultation?.id] // Only depend on ID
  );

  const handlePatientNameClick = useCallback(() => {
    setIsEditingPatientName(true);
    const currentConsultation = consultation || previousConsultationRef.current;
    setEditedPatientName(currentConsultation?.patientName || "");
  }, [consultation?.id]); // Only depend on ID

  const handlePatientNameBlur = useCallback(async () => {
    setIsEditingPatientName(false);
    const currentConsultation = consultation || previousConsultationRef.current;
    if (!currentConsultation) return;

    const updated = {
      ...currentConsultation,
      patientName: editedPatientName.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await storage.save(updated);
    setConsultation(updated);
  }, [consultation?.id, editedPatientName]); // Only depend on ID and editedPatientName

  const handlePatientNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
      if (e.key === "Escape") {
        const currentConsultation =
          consultation || previousConsultationRef.current;
        setEditedPatientName(currentConsultation?.patientName || "");
        setIsEditingPatientName(false);
      }
    },
    [consultation?.id] // Only depend on ID
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Memoize tabs to prevent unnecessary rerenders
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
      {
        id: "patientMessage",
        label: t("consultation.patientMessage"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: "referralReason",
        label: t("consultation.referralReason"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: "referralResponse",
        label: t("consultation.referralResponse"),
        icon: <FileText className="w-4 h-4" />,
      },
    ],
    [t]
  );

  // Use previous consultation during transition if current is null
  // This ensures smooth transitions between consultations
  const displayConsultation = consultation || previousConsultationRef.current;

  // Memoize conversation and transcript props to prevent unnecessary TranscriptDisplay re-renders
  const transcriptProps = useMemo(
    () => ({
      conversation: conversation,
      rawTranscript: displayConsultation?.transcript,
    }),
    [conversation, displayConsultation?.transcript]
  );

  // Memoize SOAP Note initial values (safe even if consultation is null)
  const soapNoteInitialValues = useMemo(
    () => ({
      subjektiv: soapNote.subjektiv,
      objektiv: soapNote.objektiv,
      beurteilungPlan: soapNote.beurteilungPlan,
      anamnese: soapNote.anamnese,
      untersuchung: soapNote.untersuchung,
      kontaktgrund: displayConsultation?.anamnese?.kontaktgrund,
      aktuellerZustand: displayConsultation?.anamnese?.aktueller_zustand,
    }),
    [soapNote, displayConsultation?.anamnese]
  );

  // Only show full page loading on very first load (when there's no consultation at all)
  if (isInitialLoading && !displayConsultation) {
    return (
      <div
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-background)" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-theme-primary" />
          <p className="text-theme-text-secondary">
            {t("common.loading") || "Wird geladen..."}
          </p>
        </div>
      </div>
    );
  }

  // If consultation is null after initial load, show error
  if (!displayConsultation && !isInitialLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-background)" }}>
        <div className="text-center">
          <p className="text-theme-text-secondary">
            {t("consultation.notFound")}
          </p>
        </div>
      </div>
    );
  }

  // Always show consultation if we have one (even if refreshing)
  // This ensures smooth transitions between consultations
  if (!displayConsultation) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <div className="p-6 pb-24">
      {/* Refresh Indicator - Only show when refreshing, not on initial load */}
      {isRefreshing && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-theme-text-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t("common.loading") || "Wird geladen..."}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <StatusBadge
              status={displayConsultation.status}
              onStatusChange={handleStatusChange}
              editable={true}
            />
            <span className="text-sm text-theme-text-secondary">
              {new Date(displayConsultation.createdAt).toLocaleDateString(
                language === "de" ? "de-DE" : "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
          <button
            onClick={handleDeleteConsultation}
            className="flex items-center gap-2 px-3 py-2 text-sm text-theme-danger hover:bg-theme-danger-light rounded-lg transition-colors"
            title={t("consultation.deleteTitle")}>
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.delete")}</span>
          </button>
        </div>
        {isEditingPatientName ? (
          <input
            ref={patientNameInputRef}
            type="text"
            value={editedPatientName}
            onChange={(e) => setEditedPatientName(e.target.value)}
            onBlur={handlePatientNameBlur}
            onKeyDown={handlePatientNameKeyDown}
            className="text-2xl font-bold text-theme-text mb-1 bg-transparent border-b-2 border-theme-primary focus:outline-none focus:border-theme-primary-dark w-full"
            placeholder={t("consultation.patientNamePlaceholder")}
          />
        ) : (
          <h1
            onClick={handlePatientNameClick}
            className="text-2xl font-bold text-theme-text mb-1 cursor-pointer hover:text-theme-primary transition-colors">
            {displayConsultation.patientName || t("consultation.detailTitle")}
          </h1>
        )}
      </div>

      {/* Content with Tabs */}
      <div className="bg-theme-card rounded-lg shadow-sm border border-theme-border">
        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCreateDocDropdown(!showCreateDocDropdown)}
                className="px-3 py-1.5 text-sm text-theme-text-secondary hover:text-theme-text hover:bg-theme-primary-light rounded-lg transition-colors flex items-center gap-1">
                <span>{t("consultation.createDocument")}</span>
                <span className="text-lg">+</span>
              </button>
              {showCreateDocDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-theme-card rounded-lg shadow-lg border border-theme-border z-10">
                  <button
                    onClick={() => {
                      setActiveTab("patientMessage");
                      setShowCreateDocDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-theme-primary-light transition-colors first:rounded-t-lg text-theme-text">
                    {t("consultation.patientMessage")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("referralReason");
                      setShowCreateDocDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-theme-primary-light transition-colors text-theme-text">
                    {t("consultation.referralReason")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("referralResponse");
                      setShowCreateDocDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-theme-primary-light transition-colors last:rounded-b-lg text-theme-text">
                    {t("consultation.referralResponse")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "transcription" && displayConsultation.transcript && (
            <div>
              {isLoadingConversation ? (
                <div className="flex items-center justify-center gap-3 py-12">
                  <Loader2 className="w-6 h-6 text-theme-accent animate-spin" />
                  <span className="text-theme-text-secondary">
                    {t("consultation.analyzingSpeakers")}
                  </span>
                </div>
              ) : (
                <TranscriptDisplay
                  conversation={transcriptProps.conversation}
                  rawTranscript={transcriptProps.rawTranscript}
                />
              )}
            </div>
          )}

          {activeTab === "patientMessage" && (
            <DocumentGenerator
              consultation={displayConsultation}
              activeDocType="patientMessage"
              onSave={handleSaveDocument}
              onDelete={handleDeleteDocument}
              savedDocuments={displayConsultation.documents || []}
              language={language}
            />
          )}

          {activeTab === "referralReason" && (
            <DocumentGenerator
              consultation={displayConsultation}
              activeDocType="referralReason"
              onSave={handleSaveDocument}
              onDelete={handleDeleteDocument}
              savedDocuments={displayConsultation.documents || []}
              language={language}
            />
          )}

          {activeTab === "referralResponse" && (
            <DocumentGenerator
              consultation={displayConsultation}
              activeDocType="referralResponse"
              onSave={handleSaveDocument}
              onDelete={handleDeleteDocument}
              savedDocuments={displayConsultation.documents || []}
              language={language}
            />
          )}

          {activeTab === "note" && (
            <div className="space-y-6">
              {/* Reanalyze Button */}
              <div className="flex justify-end px-6">
                <button
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isReanalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("consultation.reanalyzing")}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{t("consultation.reanalyze")}</span>
                    </>
                  )}
                </button>
              </div>
              <SOAPNote
                initialValues={soapNoteInitialValues}
                onSave={async (values) => {
                  const currentConsultation =
                    consultation || previousConsultationRef.current;
                  if (!currentConsultation) return;

                  // Değerleri güncelle
                  soapNoteRef.current = {
                    subjektiv: values.subjektiv,
                    objektiv: values.objektiv,
                    beurteilungPlan: values.beurteilungPlan,
                    anamnese: values.anamnese,
                    untersuchung: values.untersuchung,
                  };

                  // Güncellenmiş konsultasyonu storage'a kaydet
                  const updated = {
                    ...currentConsultation,
                    soapNote: soapNoteRef.current,
                    anamnese: {
                      kontaktgrund: values.kontaktgrund,
                      aktueller_zustand: values.aktuellerZustand,
                    },
                    updatedAt: new Date().toISOString(),
                  };
                  await storage.save(updated);
                  setConsultation(updated);
                  setSoapNote(soapNoteRef.current);
                  showSuccess(t("consultation.noteSaved"));
                }}
                onDelete={(field) => {
                  if (
                    field === "kontaktgrund" ||
                    field === "aktueller_zustand"
                  ) {
                    handleAnamneseDelete(field as any);
                  } else {
                    handleSoapNoteDelete(field as any);
                  }
                }}
                onAdd={(field) => {
                  if (
                    field === "kontaktgrund" ||
                    field === "aktueller_zustand"
                  ) {
                    handleAnamneseAdd(field as any);
                  } else {
                    handleSoapNoteAdd(field as any);
                  }
                }}
                editable={true}
                template={
                  selectedTemplate as "dokumentation" | "kurzdokumentation"
                }
                onAddOrAdjust={(field, currentText) => {
                  setAddOrAdjustTarget({
                    type: field as
                      | "subjektiv"
                      | "objektiv"
                      | "beurteilungPlan"
                      | "anamnese"
                      | "untersuchung"
                      | "kontaktgrund"
                      | "aktueller_zustand"
                      | null,
                    currentText,
                  });
                  setIsAddOrAdjustOpen(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add or Adjust Modal */}
      <AddOrAdjustModal
        isOpen={isAddOrAdjustOpen}
        onClose={() => {
          setIsAddOrAdjustOpen(false);
          setAddOrAdjustTarget({ type: null });
        }}
        onAdd={handleAddOrAdjustConfirm}
        currentText={addOrAdjustTarget.currentText || ""}
        fieldLabel={addOrAdjustTarget.type || t("consultation.note")}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("consultation.deleteTitle")}
        message={t("consultation.deleteMessage")}
      />
    </div>
  );
}
