/**
 * Appointments slice. Caches the list of appointments, lastFetchedAt, loading and error.
 * Use after fetching from storage to avoid refetching on every mount.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Appointment } from "@/lib/storage";

export interface AppointmentsState {
  list: Appointment[];
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  list: [],
  lastFetchedAt: null,
  isLoading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.list = action.payload;
      state.lastFetchedAt = Date.now();
      state.error = null;
    },
    setAppointment: (state, action: PayloadAction<Appointment>) => {
      const idx = state.list.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) {
        state.list[idx] = action.payload;
      } else {
        state.list.push(action.payload);
        state.list.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      }
      state.lastFetchedAt = Date.now();
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      if (!state.list.some((a) => a.id === action.payload.id)) {
        state.list.push(action.payload);
        state.list.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      }
      state.lastFetchedAt = Date.now();
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((a) => a.id !== action.payload);
    },
    setAppointmentsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAppointmentsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAppointments: (state) => {
      state.list = [];
      state.lastFetchedAt = null;
      state.error = null;
    },
  },
});

export const {
  setAppointments,
  setAppointment,
  addAppointment,
  removeAppointment,
  setAppointmentsLoading,
  setAppointmentsError,
  clearAppointments,
} = appointmentsSlice.actions;

export const selectAppointmentsList = (state: { appointments: AppointmentsState }) =>
  state.appointments.list;
export const selectAppointmentsLastFetchedAt = (state: { appointments: AppointmentsState }) =>
  state.appointments.lastFetchedAt;
export const selectAppointmentById = (id: string) => (state: { appointments: AppointmentsState }) =>
  state.appointments.list.find((a) => a.id === id) ?? null;
export const selectAppointmentsLoading = (state: { appointments: AppointmentsState }) =>
  state.appointments.isLoading;
export const selectAppointmentsError = (state: { appointments: AppointmentsState }) =>
  state.appointments.error;

export default appointmentsSlice.reducer;
