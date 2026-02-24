/**
 * API request/response types for all AI endpoints. Each section matches one endpoint
 * defined in store/api/aiApi.ts (transcribe, identifySpeakers, analyze, etc.).
 */
// --- POST /api/ai/transcribe ---
export interface TranscribeRequest {
  formData: FormData; // { audio: File, language?: string }
}
export interface TranscribeResponse {
  transcript: string;
}

// --- POST /api/ai/identify-speakers ---
export interface IdentifySpeakersRequest {
  transcript: string;
}
export interface IdentifySpeakersResponse {
  conversation: Array<{ speaker: "Doktor" | "Hasta"; text: string }>;
}

// --- POST /api/ai/analyze ---
export interface AnalyzeRequest {
  transcript: string;
  language?: "de" | "en";
}
export interface AnalysisResult {
  patient_complaint: string;
  symptoms: string[];
  duration_frequency: string;
  preliminary_summary: string;
  doctor_notes_draft: string;
}
export interface AnalyzeResponse {
  analysis: AnalysisResult;
}

// --- POST /api/ai/analyze-with-template ---
export interface AnalyzeWithTemplateRequest {
  transcript: string;
  template: string; // dokumentation | kurzdokumentation | standard
  existingNote?: string;
  language?: "de" | "en";
}
export interface SoapNoteResult {
  kontaktgrund?: string;
  aktuellerZustand?: string;
  subjektiv?: string;
  objektiv?: string;
  beurteilungPlan?: string;
  anamnese?: string;
  untersuchung?: string;
}
export interface AnalyzeWithTemplateResponse {
  soapNote: SoapNoteResult;
}

// --- POST /api/ai/regenerate ---
export interface RegenerateRequest {
  text?: string;
  currentDocument?: { content: Record<string, unknown> };
  consultationData?: Record<string, unknown>;
  documentType?: string;
  language?: string;
  doctorName?: string;
}
export interface RegenerateResponse {
  text: string;
}

// --- POST /api/ai/rewrite-text ---
export type RewriteStyle =
  | "shorter"
  | "detailed"
  | "clearer"
  | "professional"
  | "structured"
  | "summary";
export interface RewriteTextRequest {
  text: string;
  style: RewriteStyle;
}
export interface RewriteTextResponse {
  rewrittenText: string;
}

// --- POST /api/ai/generate-document ---
export interface GenerateDocumentRequest {
  documentType: string; // patientMessage | referralReason | referralResponse
  patientName: string;
  complaint: string;
  symptoms: string;
  diagnosis: string;
  language?: "de" | "en";
  doctorName?: string;
  doctorInstructions?: string;
}
export interface GenerateDocumentResponse {
  content: Record<string, unknown>;
}
