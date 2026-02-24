/**
 * Redux store root. Configures the store with all reducers (auth, userData, consultations,
 * appointments, ui, app) and RTK Query API middleware. Exports store, RootState, and AppDispatch.
 */
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import appReducer from "./slices/ui/appSlice";
import authReducer from "./slices/auth/authSlice";
import userDataReducer from "./slices/data/userDataSlice";
import consultationsReducer from "./slices/data/consultationsSlice";
import appointmentsReducer from "./slices/data/appointmentsSlice";
import uiReducer from "./slices/ui/uiSlice";
import { aiApi } from "./api/aiApi";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    userData: userDataReducer,
    consultations: consultationsReducer,
    appointments: appointmentsReducer,
    ui: uiReducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aiApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
