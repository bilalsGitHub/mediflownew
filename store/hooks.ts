/**
 * Typed Redux hooks for use in components. useAppDispatch and useAppSelector are bound to
 * AppDispatch and RootState so you get correct types without passing generics each time.
 */
import { useDispatch, useSelector, useStore } from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<typeof import("./index").store>();
