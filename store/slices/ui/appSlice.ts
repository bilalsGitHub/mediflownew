/**
 * App slice. Keeps a log of recent API requests (method, url, status, error) for debugging.
 * Used by ApiLogPanel and by the AI API base query to record each request.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ApiLogEntry {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  status?: "pending" | "fulfilled" | "rejected";
  error?: string;
}

interface AppState {
  /** Recent API requests for debugging and the API log panel. */
  apiLog: ApiLogEntry[];
  maxLogEntries: number;
}

const initialState: AppState = {
  apiLog: [],
  maxLogEntries: 50,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    logRequest: (
      state,
      action: PayloadAction<{ method: string; url: string; id?: string }>
    ) => {
      const id = action.payload.id ?? `req-${Date.now()}`;
      state.apiLog.unshift({
        id,
        method: action.payload.method,
        url: action.payload.url,
        timestamp: Date.now(),
        status: "pending",
      });
      state.apiLog = state.apiLog.slice(0, state.maxLogEntries);
    },
    logRequestFulfilled: (
      state,
      action: PayloadAction<{ id: string }>
    ) => {
      const entry = state.apiLog.find((e) => e.id === action.payload.id);
      if (entry) entry.status = "fulfilled";
    },
    logRequestRejected: (
      state,
      action: PayloadAction<{ id: string; error?: string }>
    ) => {
      const entry = state.apiLog.find((e) => e.id === action.payload.id);
      if (entry) {
        entry.status = "rejected";
        entry.error = action.payload.error;
      }
    },
    clearApiLog: (state) => {
      state.apiLog = [];
    },
  },
});

export const {
  logRequest,
  logRequestFulfilled,
  logRequestRejected,
  clearApiLog,
} = appSlice.actions;
export default appSlice.reducer;
