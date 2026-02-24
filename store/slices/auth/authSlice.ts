/**
 * Auth slice. Holds current user, loading flags (isLoading, isLoggingIn, isRegistering),
 * and error messages (loginError, registerError). Synced with AuthProvider / Supabase.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/store/types/auth";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  loginError: string | null;
  registerError: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isLoggingIn: false,
  isRegistering: false,
  loginError: null,
  registerError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loginError = null;
      state.registerError = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoggingIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggingIn = action.payload;
      if (action.payload) state.loginError = null;
    },
    setRegistering: (state, action: PayloadAction<boolean>) => {
      state.isRegistering = action.payload;
      if (action.payload) state.registerError = null;
    },
    setLoginError: (state, action: PayloadAction<string | null>) => {
      state.loginError = action.payload;
      state.isLoggingIn = false;
    },
    setRegisterError: (state, action: PayloadAction<string | null>) => {
      state.registerError = action.payload;
      state.isRegistering = false;
    },
    logout: (state) => {
      state.user = null;
      state.loginError = null;
      state.registerError = null;
      state.isLoggingIn = false;
      state.isRegistering = false;
    },
    clearAuthErrors: (state) => {
      state.loginError = null;
      state.registerError = null;
    },
  },
});

export const {
  setUser,
  setLoading,
  setLoggingIn,
  setRegistering,
  setLoginError,
  setRegisterError,
  logout,
  clearAuthErrors,
} = authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectLoginError = (state: { auth: AuthState }) => state.auth.loginError;
export const selectRegisterError = (state: { auth: AuthState }) => state.auth.registerError;
export const selectIsLoggingIn = (state: { auth: AuthState }) => state.auth.isLoggingIn;
export const selectIsRegistering = (state: { auth: AuthState }) => state.auth.isRegistering;

export default authSlice.reducer;
