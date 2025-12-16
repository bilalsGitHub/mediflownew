// Supabase database helper for consultations and appointments

import { supabase } from "./supabase/client";

// Document types for AI-generated content
export interface PatientMessage {
  greeting?: string;
  diagnosis?: string;
  treatment?: string;
  recommendations?: string;
  closing?: string;
  doctorName?: string;
  doctorTitle?: string;
  date?: string;
}

export interface ReferralReason {
  date?: string;
  diagnosis?: string;
  requestedAction?: string;
  anamneseAndFindings?: string;
  doctorName?: string;
  doctorTitle?: string;
}

export interface ReferralResponse {
  greeting?: string;
  patientInfo?: string;
  diagnosis?: string;
  recommendedAction?: string;
  thanks?: string;
  doctorName?: string;
  doctorTitle?: string;
  date?: string;
}

// Document with metadata for list management
export interface SavedDocument {
  id: string;
  type: "patientMessage" | "referralReason" | "referralResponse";
  content: PatientMessage | ReferralReason | ReferralResponse;
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface Consultation {
  id: string;
  patientName?: string;
  transcript?: string;
  conversation?: Array<{ speaker: "Doktor" | "Hasta"; text: string }>;
  analysis?: {
    patient_complaint: string;
    symptoms: string[];
    duration_frequency: string;
    preliminary_summary: string;
    doctor_notes_draft: string;
  };
  doctorNotes?: string;
  status:
    | "draft"
    | "approved"
    | "rejected"
    | "not_transferred"
    | "transferred"
    | "completed";
  anamnese?: {
    kontaktgrund?: string;
    aktueller_zustand?: string;
  };
  soapNote?: {
    subjektiv?: string;
    objektiv?: string;
    beurteilungPlan?: string;
    anamnese?: string;
    untersuchung?: string;
  };
  template?: string;
  icd10Codes?: Array<{
    code: string;
    description: string;
  }>;
  documents?: SavedDocument[];
  createdAt: string;
  updatedAt: string;
}

// Convert Supabase consultation to app Consultation
const supabaseToConsultation = (row: any): Consultation => ({
  id: row.id,
  patientName: row.patient_name || undefined,
  transcript: row.transcript || undefined,
  conversation: row.conversation || undefined,
  analysis: row.analysis || undefined,
  doctorNotes: row.doctor_notes || undefined,
  status: row.status || "not_transferred",
  anamnese: row.anamnese || undefined,
  soapNote: row.soap_note || undefined,
  template: row.template || undefined,
  icd10Codes: undefined, // Will be loaded separately
  documents: undefined, // Will be loaded separately
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Convert app Consultation to Supabase format
const consultationToSupabase = (consultation: Consultation) => ({
  patient_name: consultation.patientName || null,
  transcript: consultation.transcript || null,
  conversation: consultation.conversation || null,
  analysis: consultation.analysis || null,
  doctor_notes: consultation.doctorNotes || null,
  status: consultation.status || "not_transferred",
  anamnese: consultation.anamnese || null,
  soap_note: consultation.soapNote || null,
  template: consultation.template || "dokumentation",
});

export const storage = {
  // Get all consultations for current user
  async getAll(): Promise<Consultation[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Use nested select to fetch all consultations with related data in fewer requests
      // This reduces N*2 requests (N consultations * 2 requests each) to just 3 requests total
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          icd10_codes (
            code,
            description
          ),
          documents (
            id,
            type,
            content,
            title,
            created_at,
            updated_at
          )
        `)
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching consultations:", error);
        return [];
      }

      if (!data) return [];

      // Map consultations with nested data
      const consultations = data.map((row: any) => {
        const consultation = supabaseToConsultation(row);

        // Map ICD10 codes from nested response
        if (row.icd10_codes && Array.isArray(row.icd10_codes)) {
          consultation.icd10Codes = row.icd10_codes.map((c: any) => ({
            code: c.code,
            description: c.description,
          }));
        }

        // Map documents from nested response
        if (row.documents && Array.isArray(row.documents)) {
          // Sort documents by created_at descending
          const sortedDocs = [...row.documents].sort(
            (a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          consultation.documents = sortedDocs.map((d: any) => ({
            id: d.id,
            type: d.type as SavedDocument["type"],
            content: d.content as SavedDocument["content"],
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            title: d.title || undefined,
          }));
        }

        return consultation;
      });

      return consultations;
    } catch (error) {
      console.error("Error in getAll:", error);
      return [];
    }
  },

  // Get consultation by id
  // Optional userId parameter to avoid redundant getUser() calls
  async get(id: string, userId?: string): Promise<Consultation | null> {
    try {
      let user;
      if (userId) {
        // Use provided userId to avoid getUser() call
        user = { id: userId };
      } else {
        // Fallback to getUser() if userId not provided
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return null;
        user = authUser;
      }

      // Use nested select to fetch consultation with related data in a single query
      // This reduces 3 separate requests to just 1 request
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          icd10_codes (
            code,
            description
          ),
          documents (
            id,
            type,
            content,
            title,
            created_at,
            updated_at
          )
        `)
        .eq("id", id)
        .eq("doctor_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching consultation:", error);
        return null;
      }

      if (!data) return null;

      const consultation = supabaseToConsultation(data);

      // Map ICD10 codes from nested response
      if (data.icd10_codes && Array.isArray(data.icd10_codes)) {
        consultation.icd10Codes = data.icd10_codes.map((c: any) => ({
          code: c.code,
          description: c.description,
        }));
      }

      // Map documents from nested response
      if (data.documents && Array.isArray(data.documents)) {
        // Sort documents by created_at descending
        const sortedDocs = [...data.documents].sort(
          (a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        consultation.documents = sortedDocs.map((d: any) => ({
          id: d.id,
          type: d.type as SavedDocument["type"],
          content: d.content as SavedDocument["content"],
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          title: d.title || undefined,
        }));
      }

      return consultation;
    } catch (error) {
      console.error("Error in get:", error);
      return null;
    }
  },

  // Save consultation (create or update)
  async save(consultation: Consultation): Promise<string> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const consultationData = consultationToSupabase(consultation);

      console.log("Saving consultation to Supabase:", {
        originalId: consultation.id,
        hasTranscript: !!consultationData.transcript,
        transcriptLength: consultationData.transcript?.length,
        hasAnalysis: !!consultationData.analysis,
        hasConversation: !!consultationData.conversation,
        status: consultationData.status,
      });

      // Check if consultation exists in database
      let consultationId = consultation.id;
      let isNewConsultation = false;
      
      if (!consultationId || consultationId.startsWith("temp-") || consultationId.match(/^\d+$/)) {
        // New consultation - create (id is timestamp string or temp-)
        isNewConsultation = true;
        const { data, error } = await supabase
          .from("consultations")
          .insert({
            doctor_id: user.id,
            ...consultationData,
          })
          .select()
          .single();

        if (error) {
          console.error("Error inserting consultation:", error);
          throw error;
        }
        
        console.log("Consultation inserted successfully:", {
          newId: data.id,
          transcriptSaved: !!data.transcript,
        });

        consultationId = data.id;
        // Update consultation object with new UUID
        consultation.id = consultationId;

        // Save ICD10 codes
        if (consultation.icd10Codes && consultation.icd10Codes.length > 0) {
          await supabase.from("icd10_codes").insert(
            consultation.icd10Codes.map((code) => ({
              consultation_id: consultationId,
              code: code.code,
              description: code.description,
            }))
          );
        }
      } else {
        // Update existing consultation (UUID format)
        const { error } = await supabase
          .from("consultations")
          .update(consultationData)
          .eq("id", consultationId)
          .eq("doctor_id", user.id);

        if (error) throw error;

        // Update ICD10 codes
        // Delete existing codes
        await supabase
          .from("icd10_codes")
          .delete()
          .eq("consultation_id", consultationId);

        // Insert new codes
        if (consultation.icd10Codes && consultation.icd10Codes.length > 0) {
          await supabase.from("icd10_codes").insert(
            consultation.icd10Codes.map((code) => ({
              consultation_id: consultationId,
              code: code.code,
              description: code.description,
            }))
          );
        }
      }

      // consultation.id is already updated above if it was a new consultation

      // Save documents - each document is saved individually to preserve other types
      // This allows multiple documents per type (patientMessage, referralReason, referralResponse)
      if (consultation.documents && consultation.documents.length > 0) {
        // Process each document individually (upsert by id)
        // This way, documents of different types are preserved
        for (const doc of consultation.documents) {
          try {
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id);
            
            if (isValidUUID) {
              // Update existing document by id (or insert if doesn't exist)
              const { data: upsertedDoc, error: upsertError } = await supabase
                .from("documents")
                .upsert({
                  id: doc.id,
                  consultation_id: consultationId,
                  type: doc.type,
                  content: doc.content,
                  title: doc.title || null,
                  created_at: doc.createdAt || new Date().toISOString(),
                  updated_at: doc.updatedAt || new Date().toISOString(),
                }, {
                  onConflict: 'id'
                })
                .select()
                .single();

              if (upsertError) {
                console.error("Error upserting document:", upsertError, doc);
                // Continue with next document
              } else if (upsertedDoc) {
                // Successfully upserted
                console.log("Document upserted:", upsertedDoc.id, upsertedDoc.type);
                // Update doc timestamps if needed
                const docIndex = consultation.documents!.findIndex(d => d.id === doc.id);
                if (docIndex >= 0) {
                  consultation.documents![docIndex].createdAt = upsertedDoc.created_at;
                  consultation.documents![docIndex].updatedAt = upsertedDoc.updated_at;
                }
              }
            } else {
              // New document - insert without id (Supabase will generate UUID)
              const { data: insertedDoc, error: insertError } = await supabase
                .from("documents")
                .insert({
                  consultation_id: consultationId,
                  type: doc.type,
                  content: doc.content,
                  title: doc.title || null,
                  created_at: doc.createdAt || new Date().toISOString(),
                  updated_at: doc.updatedAt || new Date().toISOString(),
                })
                .select()
                .single();

              if (insertError) {
                console.error("Error inserting document:", insertError, doc);
                // Continue with next document
              } else if (insertedDoc) {
                // Update doc.id with new UUID from Supabase
                const docIndex = consultation.documents!.findIndex(d => d.id === doc.id);
                if (docIndex >= 0) {
                  consultation.documents![docIndex].id = insertedDoc.id;
                  consultation.documents![docIndex].createdAt = insertedDoc.created_at;
                  consultation.documents![docIndex].updatedAt = insertedDoc.updated_at;
                }
                console.log("Document inserted:", insertedDoc.id, insertedDoc.type);
              }
            }
          } catch (error) {
            console.error("Unexpected error saving document:", error, doc);
            // Continue with next document
          }
        }
      }
      // Note: We don't delete documents that are not in consultation.documents
      // This allows multiple documents per type to be preserved
      // Each type (patientMessage, referralReason, referralResponse) can have multiple documents

      // Return the consultation ID (new UUID for new consultations, existing ID for updates)
      return consultationId;
    } catch (error) {
      console.error("Error in save:", error);
      throw error;
    }
  },

  // Delete consultation
  async delete(id: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("consultations")
        .delete()
        .eq("id", id)
        .eq("doctor_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  // Clear all (for testing) - Supabase'de kullanılmaz
  clear(): void {
    console.warn("clear() is not supported with Supabase");
  },
};

// Appointment interface
export interface Appointment {
  id: string;
  name: string;
  patientName: string;
  patientNumber: string;
  problem?: string;
  startTime: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Convert Supabase appointment to app Appointment
const supabaseToAppointment = (row: any): Appointment => ({
  id: row.id,
  name: row.name,
  patientName: row.patient_name,
  patientNumber: row.patient_number || "",
  problem: row.problem || undefined,
  startTime: row.start_time,
  duration: row.duration || 25,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const appointmentStorage = {
  // Get all appointments for current user
  async getAll(): Promise<Appointment[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", user.id)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return (data || []).map(supabaseToAppointment);
    } catch (error) {
      console.error("Error in getAll:", error);
      return [];
    }
  },

  // Get appointment by id
  async get(id: string): Promise<Appointment | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", id)
        .eq("doctor_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching appointment:", error);
        return null;
      }

      return data ? supabaseToAppointment(data) : null;
    } catch (error) {
      console.error("Error in get:", error);
      return null;
    }
  },

  // Get appointments for a specific date
  async getByDate(date: Date): Promise<Appointment[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", user.id)
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching appointments by date:", error);
        return [];
      }

      return (data || []).map(supabaseToAppointment);
    } catch (error) {
      console.error("Error in getByDate:", error);
      return [];
    }
  },

  // Save appointment (create or update)
  async save(appointment: Appointment): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const appointmentData = {
        name: appointment.name,
        patient_name: appointment.patientName,
        patient_number: appointment.patientNumber || null,
        problem: appointment.problem || null,
        start_time: appointment.startTime,
        duration: appointment.duration || 25,
      };

      if (!appointment.id || appointment.id.startsWith("temp-") || appointment.id.match(/^\d+$/)) {
        // New appointment - create
        const { data, error } = await supabase
          .from("appointments")
          .insert({
            doctor_id: user.id,
            ...appointmentData,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update appointment id
        if (data) {
          appointment.id = data.id;
        }
      } else {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointment.id)
          .eq("doctor_id", user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error in save:", error);
      throw error;
    }
  },

  // Delete appointment
  async delete(id: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .eq("doctor_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  // Clear all (for testing) - Supabase'de kullanılmaz
  clear(): void {
    console.warn("clear() is not supported with Supabase");
  },
};
