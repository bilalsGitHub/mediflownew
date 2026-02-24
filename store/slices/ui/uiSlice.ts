/**
 * UI slice. Global UI state: sidebar open/closed and activeModal id.
 * Use for layout (e.g. mobile sidebar) and modal visibility.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  sidebarOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
  },
});

export const { setSidebarOpen, toggleSidebar, setActiveModal } = uiSlice.actions;

export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectActiveModal = (state: { ui: UIState }) => state.ui.activeModal;

export default uiSlice.reducer;
