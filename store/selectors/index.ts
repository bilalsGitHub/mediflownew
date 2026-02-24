/**
 * Central export of all slice selectors. Import from here for use with useAppSelector
 * (e.g. selectUser, selectConsultationsList, selectSidebarOpen).
 */
export {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectLoginError,
  selectRegisterError,
  selectIsLoggingIn,
  selectIsRegistering,
} from "../slices/auth/authSlice";

export {
  selectProfile,
  selectPreferences,
  selectLastLoadedAt,
} from "../slices/data/userDataSlice";

export {
  selectConsultationsList,
  selectSelectedConsultationId,
  selectConsultationById,
  selectConsultationsLastFetchedAt,
  selectConsultationsLoading,
  selectConsultationsError,
} from "../slices/data/consultationsSlice";

export {
  selectAppointmentsList,
  selectAppointmentsLastFetchedAt,
  selectAppointmentById,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from "../slices/data/appointmentsSlice";

export { selectSidebarOpen, selectActiveModal } from "../slices/ui/uiSlice";
