/**
 * Consultations slice. Caches the list of consultations, selected consultation id,
 * lastFetchedAt, loading and error. Use after fetching from storage and for UI selection state.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Consultation } from "@/lib/storage";

export interface ConsultationsState {
  list: Consultation[];
  selectedId: string | null;
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ConsultationsState = {
  list: [],
  selectedId: null,
  lastFetchedAt: null,
  isLoading: false,
  error: null,
};

const consultationsSlice = createSlice({
  name: "consultations",
  initialState,
  reducers: {
    setConsultations: (state, action: PayloadAction<Consultation[]>) => {
      state.list = action.payload;
      state.lastFetchedAt = Date.now();
      state.error = null;
    },
    setConsultation: (state, action: PayloadAction<Consultation>) => {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = action.payload;
      } else {
        state.list.unshift(action.payload);
      }
      state.lastFetchedAt = Date.now();
    },
    addConsultation: (state, action: PayloadAction<Consultation>) => {
      if (!state.list.some((c) => c.id === action.payload.id)) {
        state.list.unshift(action.payload);
      }
      state.lastFetchedAt = Date.now();
    },
    removeConsultation: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    },
    setSelectedConsultationId: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    setConsultationsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setConsultationsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearConsultations: (state) => {
      state.list = [];
      state.selectedId = null;
      state.lastFetchedAt = null;
      state.error = null;
    },
  },
});

export const {
  setConsultations,
  setConsultation,
  addConsultation,
  removeConsultation,
  setSelectedConsultationId,
  setConsultationsLoading,
  setConsultationsError,
  clearConsultations,
} = consultationsSlice.actions;

export const selectConsultationsList = (state: { consultations: ConsultationsState }) =>
  state.consultations.list;
export const selectSelectedConsultationId = (state: { consultations: ConsultationsState }) =>
  state.consultations.selectedId;
export const selectConsultationById = (id: string) => (state: { consultations: ConsultationsState }) =>
  state.consultations.list.find((c) => c.id === id) ?? null;
export const selectConsultationsLastFetchedAt = (state: { consultations: ConsultationsState }) =>
  state.consultations.lastFetchedAt;
export const selectConsultationsLoading = (state: { consultations: ConsultationsState }) =>
  state.consultations.isLoading;
export const selectConsultationsError = (state: { consultations: ConsultationsState }) =>
  state.consultations.error;

export default consultationsSlice.reducer;
