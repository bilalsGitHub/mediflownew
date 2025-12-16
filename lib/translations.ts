// Translation keys for the application

export type Language = "de" | "en";

export const translations = {
  de: {
    // Sidebar
    sidebar: {
      allConsultations: "Alle Konsultationen",
      doctorAssistant: "Arztassistent",
      today: "Heute",
      yesterday: "Gestern",
      deleteTitle: "Konsultation löschen",
      deleteMessage:
        "Sind Sie sicher, dass Sie diese Konsultation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      deleteTooltip: "Konsultation löschen",
      notSpecified: "Nicht angegeben",
      search: "Suchen...",
    },
    // Status
    status: {
      transferred: "Übertragen",
      not_transferred: "Nicht übertragen",
      completed: "Abgeschlossen",
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      draft: "Entwurf",
    },
    // Common
    common: {
      loading: "Wird geladen...",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      close: "Schließen",
      copy: "Kopieren",
      copied: "Kopiert",
      yes: "Ja",
      no: "Nein",
      confirm: "Bestätigen",
    },
    // Auth
    auth: {
      login: "Anmelden",
      logout: "Abmelden",
      register: "Registrieren",
      email: "E-Mail",
      password: "Passwort",
      fullName: "Vollständiger Name",
      country: "Land",
      age: "Alter",
      language: "Sprache",
      loginButton: "Anmelden",
      registerButton: "Registrieren",
      alreadyHaveAccount: "Haben Sie bereits ein Konto?",
      noAccount: "Haben Sie kein Konto?",
      loginHere: "Hier anmelden",
      registerHere: "Hier registrieren",
      testUser: "Testbenutzer",
      testEmail: "E-Mail: doctor@test.com",
      testPassword: "Passwort: test123",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      welcome: "Willkommen",
      startConsultation: "Neue Konsultation starten",
      start: "Start",
      newConsultation: "Neue Konsultation",
      systemActive: "System aktiv und funktioniert",
      purpose: "MediFlow spart Ihnen Zeit bei der Patientenbetreuung",
      purposeDescription:
        "Automatisierte Aufnahme und KI-Analyse Ihrer Gespräche, damit Sie sich voll auf den Patienten konzentrieren können.",
      features: "Funktionen",
      timeSaved: "Zeitersparnis",
      feature1Title: "Automatische Aufnahme",
      feature1Desc:
        "Einfach Mikrofon aktivieren – das System zeichnet das gesamte Gespräch auf",
      feature1Time: "Spart 5-10 Min. pro Gespräch",
      feature2Title: "KI-Transkription",
      feature2Desc:
        "Gespräche werden automatisch in Text umgewandelt – präzise und sofort",
      feature2Time: "Spart 10-15 Min. manuelles Tippen",
      feature3Title: "Intelligente Analyse",
      feature3Desc:
        "KI erstellt strukturierte Notizen: Anamnese, Symptome, Diagnosevorschläge",
      feature3Time: "Spart 15-20 Min. Notizen schreiben",
      feature4Title: "SOAP-Notizen",
      feature4Desc:
        "Automatisch strukturierte medizinische Notizen nach SOAP-Standard",
      feature4Time: "Spart 10-15 Min. Formatierung",
      feature5Title: "KI-Dokumente",
      feature5Desc:
        "Automatische Erstellung von Patientenbriefen, Überweisungen und Antworten",
      feature5Time: "Spart 20-30 Min. Dokumentation",
      feature6Title: "Sprachsteuerung",
      feature6Desc:
        "Notizen und Dokumente per Spracheingabe erstellen – hands-free",
      feature6Time: "Spart 5-10 Min. Tippen",
      totalTimeSaved: "Bis zu 80 Minuten pro Tag gespart",
      totalTimeSavedDesc:
        "Mehr Zeit für Ihre Patienten, weniger Zeit für Dokumentation",
      getStarted: "Jetzt starten",
    },
    // Recording
    recording: {
      activateMicrophone: "Start",
      recording: "Aufnahme läuft",
      paused: "Pausiert",
      pause: "Pause",
      resume: "Fortsetzen",
      stop: "Stoppen",
      reset: "Zurücksetzen",
      retry: "Erneut aufnehmen",
      cancelled: "Aufnahme abgebrochen",
    },
    // Quick Voice
    quickVoice: {
      title: "Schnelle Spracherkennung",
      button: "Sprache",
      clickToStart: "Klicken Sie, um die Aufnahme zu starten",
      recording: "Aufnahme läuft...",
      processing: "Wird verarbeitet...",
      transcript: "Transkript",
      newRecording: "Neue Aufnahme",
    },
    // Calendar
    calendar: {
      title: "Kalender",
      button: "Kalender",
      selectDate: "Wählen Sie ein Datum aus, um Patienten zu sehen",
      selectedDate: "Ausgewähltes Datum",
      noPatients: "Keine Patienten an diesem Tag",
      unnamedPatient: "Unbenannter Patient",
      symptoms: "Symptome",
      complaint: "Beschwerde",
      recommendations: "Empfehlungen",
      noData: "Keine Daten verfügbar",
      goToDetails: "Zu Details",
      today: "Heute",
      previousDay: "Vorheriger Tag",
      nextDay: "Nächster Tag",
      status: "Status",
    },
    // Appointments
    appointments: {
      title: "Terminplanung",
      button: "Termine",
      new: "Neu",
      edit: "Bearbeiten",
      delete: "Löschen",
      selectDate: "Wählen Sie ein Datum aus, um Termine zu sehen",
      noAppointments: "Keine Termine an diesem Tag",
      addFirst: "Ersten Termin hinzufügen",
      name: "Termin Name",
      namePlaceholder: "z.B. Kontrolluntersuchung",
      patientName: "Patientenname",
      patientNamePlaceholder: "Max Mustermann",
      patientNumber: "Patientennummer",
      patientNumberPlaceholder: "12345",
      startTime: "Startzeit",
      duration: "Dauer (Minuten)",
      problem: "Problem (optional)",
      problemPlaceholder: "Kurze Beschreibung des Problems...",
      confirmDelete: "Möchten Sie diesen Termin wirklich löschen?",
      fillRequired: "Bitte füllen Sie alle Pflichtfelder aus",
    },
    // Consultation
    consultation: {
      detailTitle: "Konsultationsdetails",
      noteSaved: "Notiz gespeichert!",
      deleteTitle: "Konsultation löschen",
      deleteMessage:
        "Sind Sie sicher, dass Sie diese Konsultation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      transcription: "Transkription",
      note: "Notiz",
      patientMessage: "Nachricht an den Patienten",
      referralReason: "Überweisungsgrund",
      referralResponse: "Überweisungsantwort",
      transcriptTitle: "Gespräch Transkript",
      transcriptNotFound: "Transkript nicht gefunden",
      speakersView: "Sprecher",
      rawTextView: "Roher Text",
      createDocument: "Dokument erstellen",
      save: "Speichern",
      copy: "Kopieren",
      delete: "Löschen",
      edit: "Bearbeiten",
      patientName: "Patientenname / Konsultationstitel",
      patientNamePlaceholder: "z.B. Max Mustermann oder Kontrolluntersuchung",
      patientNameHint:
        "Optional: Geben Sie einen Namen ein, um die Konsultation später leichter zu finden",
      template: "Template",
      templateChanging: "Template wird geändert...",
      regenerate: "Neu generieren",
      addEntry: "Eintrag hinzufügen",
      addOrAdjust: "Hinzufügen oder anpassen",
      copyNote: "Notiz kopieren",
      deleteDocumentTitle: "Dokument löschen",
      deleteDocumentMessage: "Möchten Sie dieses Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      clearDocumentTitle: "Dokument leeren",
      clearDocumentMessage: "Möchten Sie den Dokumentinhalt wirklich leeren? Alle nicht gespeicherten Änderungen gehen verloren.",
      regenerateError:
        "Zum Neu generieren muss zuerst ein Notizinhalt vorhanden sein.",
      regenerateFailed: "Neu generieren fehlgeschlagen",
      regenerateSuccess: "Notiz erfolgreich neu generiert!",
      regenerateErrorOccurred: "Beim Neu generieren ist ein Fehler aufgetreten",
      addOrAdjustTitle: "Text hinzufügen oder bearbeiten",
      addTextTitle: "Text hinzufügen",
      currentField: "Aktuell",
      addOrAdjustWithVoice: "Mit Sprachaufnahme hinzufügen oder ersetzen",
      addWithVoice: "Mit Sprachaufnahme hinzufügen",
      processingAudio: "Sprachaufnahme wird verarbeitet...",
      transcribedText: "Transkribierter Text",
      transcribedTextPlaceholder: "Transkribierter Text wird hier angezeigt...",
      addToExisting: "Zum vorhandenen Text hinzufügen",
      replaceExisting: "Vorhandenen Text ersetzen",
      add: "Hinzufügen",
      recordAgain: "Erneut aufnehmen",
      transcriptionError: "Transkript konnte nicht erstellt werden",
      transcriptionEmpty:
        "Transkript ist leer. Bitte überprüfen Sie Ihre Sprachaufnahme.",
      errorOccurred: "Ein Fehler ist aufgetreten",
      startRecordingHint:
        "Um eine neue Konsultation zu starten, tippen Sie auf die Aufnahme-Schaltfläche",
      analyzing: "Wird analysiert...",
      analyzingDescription:
        "Sprachaufnahme wird in Text umgewandelt und analysiert.",
      analyzingNote: "Dieser Vorgang kann einige Sekunden dauern.",
      analyzingSpeakers: "Sprecher werden analysiert...",
      doctor: "Arzt",
      patient: "Patient",
    },
    // Analysis
    analysis: {
      analyzing: "Wird analysiert...",
      patientComplaint: "Patientenbeschwerde",
      symptoms: "Symptome",
      duration: "Dauer/Häufigkeit",
      summary: "Zusammenfassung",
      doctorNotes: "Arztnotizen",
    },
    // Settings
    settings: {
      theme: "Farbschema auswählen",
      settings: "Einstellungen",
    },
  },
  en: {
    // Sidebar
    sidebar: {
      allConsultations: "All Consultations",
      doctorAssistant: "Doctor Assistant",
      today: "Today",
      yesterday: "Yesterday",
      deleteTitle: "Delete Consultation",
      deleteMessage:
        "Are you sure you want to delete this consultation? This action cannot be undone.",
      deleteTooltip: "Delete consultation",
      notSpecified: "Not specified",
      search: "Search...",
    },
    // Status
    status: {
      transferred: "Transferred",
      not_transferred: "Not Transferred",
      completed: "Completed",
      approved: "Approved",
      rejected: "Rejected",
      draft: "Draft",
    },
    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      copy: "Copy",
      copied: "Copied",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
    },
    // Auth
    auth: {
      login: "Login",
      logout: "Logout",
      register: "Register",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      country: "Country",
      age: "Age",
      language: "Language",
      loginButton: "Sign In",
      registerButton: "Sign Up",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      loginHere: "Sign in here",
      registerHere: "Sign up here",
      testUser: "Test User",
      testEmail: "Email: doctor@test.com",
      testPassword: "Password: test123",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome",
      startConsultation: "Start new consultation",
      start: "Start",
      newConsultation: "New Consultation",
      systemActive: "System active and running",
      purpose: "MediFlow saves you time in patient care",
      purposeDescription:
        "Automated recording and AI analysis of your conversations so you can focus fully on the patient.",
      features: "Features",
      timeSaved: "Time Saved",
      feature1Title: "Automatic Recording",
      feature1Desc:
        "Simply activate microphone – system records entire conversation",
      feature1Time: "Saves 5-10 min per consultation",
      feature2Title: "AI Transcription",
      feature2Desc:
        "Conversations automatically converted to text – precise and instant",
      feature2Time: "Saves 10-15 min manual typing",
      feature3Title: "Smart Analysis",
      feature3Desc:
        "AI creates structured notes: anamnesis, symptoms, diagnosis suggestions",
      feature3Time: "Saves 15-20 min note writing",
      feature4Title: "SOAP Notes",
      feature4Desc:
        "Automatically structured medical notes following SOAP standard",
      feature4Time: "Saves 10-15 min formatting",
      feature5Title: "AI Documents",
      feature5Desc:
        "Automatic creation of patient letters, referrals and responses",
      feature5Time: "Saves 20-30 min documentation",
      feature6Title: "Voice Control",
      feature6Desc: "Create notes and documents via voice input – hands-free",
      feature6Time: "Saves 5-10 min typing",
      totalTimeSaved: "Up to 80 minutes saved per day",
      totalTimeSavedDesc:
        "More time for your patients, less time for documentation",
      getStarted: "Get Started",
    },
    // Recording
    recording: {
      activateMicrophone: "Start",
      recording: "Recording",
      paused: "Paused",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop",
      reset: "Reset",
      retry: "Retry",
      cancelled: "Recording cancelled",
    },
    // Quick Voice
    quickVoice: {
      title: "Quick Voice Recognition",
      button: "Voice",
      clickToStart: "Click to start recording",
      recording: "Recording...",
      processing: "Processing...",
      transcript: "Transcript",
      newRecording: "New Recording",
    },
    // Calendar
    calendar: {
      title: "Calendar",
      button: "Calendar",
      selectDate: "Select a date to see patients",
      selectedDate: "Selected Date",
      noPatients: "No patients on this day",
      unnamedPatient: "Unnamed Patient",
      symptoms: "Symptoms",
      complaint: "Complaint",
      recommendations: "Recommendations",
      noData: "No data available",
      goToDetails: "Go to Details",
      today: "Today",
      previousDay: "Previous Day",
      nextDay: "Next Day",
      status: "Status",
    },
    // Appointments
    appointments: {
      title: "Appointment Scheduling",
      button: "Appointments",
      new: "New",
      edit: "Edit",
      delete: "Delete",
      selectDate: "Select a date to see appointments",
      noAppointments: "No appointments on this day",
      addFirst: "Add first appointment",
      name: "Appointment Name",
      namePlaceholder: "e.g. Check-up",
      patientName: "Patient Name",
      patientNamePlaceholder: "John Doe",
      patientNumber: "Patient Number",
      patientNumberPlaceholder: "12345",
      startTime: "Start Time",
      duration: "Duration (Minutes)",
      problem: "Problem (optional)",
      problemPlaceholder: "Brief description of the problem...",
      confirmDelete: "Are you sure you want to delete this appointment?",
      fillRequired: "Please fill in all required fields",
    },
    // Consultation
    consultation: {
      detailTitle: "Consultation Details",
      noteSaved: "Note saved!",
      deleteTitle: "Delete Consultation",
      deleteMessage:
        "Are you sure you want to delete this consultation? This action cannot be undone.",
      transcription: "Transcription",
      note: "Note",
      patientMessage: "Message to Patient",
      referralReason: "Referral Reason",
      referralResponse: "Referral Response",
      transcriptTitle: "Conversation Transcript",
      transcriptNotFound: "Transcript not found",
      speakersView: "Speakers",
      rawTextView: "Raw Text",
      createDocument: "Create document",
      save: "Save",
      copy: "Copy",
      delete: "Delete",
      edit: "Edit",
      patientName: "Patient Name / Consultation Title",
      patientNamePlaceholder: "e.g. John Doe or Follow-up Examination",
      patientNameHint:
        "Optional: Enter a name to find the consultation more easily later",
      template: "Template",
      templateChanging: "Changing template...",
      regenerate: "Regenerate",
      addEntry: "Add entry",
      addOrAdjust: "Add or adjust",
      copyNote: "Copy note",
      deleteDocumentTitle: "Delete Document",
      deleteDocumentMessage: "Are you sure you want to delete this document? This action cannot be undone.",
      clearDocumentTitle: "Clear Document",
      clearDocumentMessage: "Are you sure you want to clear the document content? All unsaved changes will be lost.",
      regenerateError: "A note content must exist first to regenerate.",
      regenerateFailed: "Regenerate failed",
      regenerateSuccess: "Note successfully regenerated!",
      regenerateErrorOccurred: "An error occurred during regeneration",
      addOrAdjustTitle: "Add or Edit Text",
      addTextTitle: "Add Text",
      currentField: "Current",
      addOrAdjustWithVoice: "Add or replace with voice recording",
      addWithVoice: "Add with voice recording",
      processingAudio: "Processing audio recording...",
      transcribedText: "Transcribed Text",
      transcribedTextPlaceholder: "Transcribed text will appear here...",
      addToExisting: "Add to Existing Text",
      replaceExisting: "Replace Existing Text",
      add: "Add",
      recordAgain: "Record Again",
      transcriptionError: "Failed to create transcript",
      transcriptionEmpty:
        "Transcript is empty. Please check your audio recording.",
      errorOccurred: "An error occurred",
      startRecordingHint:
        "To start a new consultation, tap the recording button",
      analyzing: "Analyzing...",
      analyzingDescription:
        "Audio recording is being converted to text and analyzed.",
      analyzingNote: "This process may take a few seconds.",
      analyzingSpeakers: "Analyzing speakers...",
      doctor: "Doctor",
      patient: "Patient",
    },
    // Analysis
    analysis: {
      analyzing: "Analyzing...",
      patientComplaint: "Patient Complaint",
      symptoms: "Symptoms",
      duration: "Duration/Frequency",
      summary: "Summary",
      doctorNotes: "Doctor Notes",
    },
    // Settings
    settings: {
      theme: "Select Color Theme",
      settings: "Settings",
    },
  },
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }

  return value || key;
}
