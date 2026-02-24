/**
 * User data slice. Stores the current user profile, preferences (language, theme, etc.),
 * and lastLoadedAt. Use for extended profile data and settings.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, UserPreferences } from "@/store/types/auth";

export interface UserDataState {
  profile: User | null;
  preferences: UserPreferences;
  lastLoadedAt: number | null;
}

const initialState: UserDataState = {
  profile: null,
  preferences: {},
  lastLoadedAt: null,
};

const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
      state.lastLoadedAt = action.payload ? Date.now() : null;
    },
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearUserData: (state) => {
      state.profile = null;
      state.preferences = {};
      state.lastLoadedAt = null;
    },
  },
});

export const { setProfile, setPreferences, clearUserData } = userDataSlice.actions;

export const selectProfile = (state: { userData: UserDataState }) => state.userData.profile;
export const selectPreferences = (state: { userData: UserDataState }) => state.userData.preferences;
export const selectLastLoadedAt = (state: { userData: UserDataState }) => state.userData.lastLoadedAt;

export default userDataSlice.reducer;
