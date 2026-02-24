"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { supabase } from "./supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import type { User, Profile, RegisterData } from "@/store/types/auth";
import {
  setUser,
  setLoading,
  setLoggingIn,
  setRegistering,
  setLoginError,
  setRegisterError,
  logout as logoutAction,
} from "@/store/slices/auth/authSlice";
import { setProfile, clearUserData } from "@/store/slices/data/userDataSlice";
import { clearConsultations } from "@/store/slices/data/consultationsSlice";
import { clearAppointments } from "@/store/slices/data/appointmentsSlice";

export type { User, Profile, RegisterData };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  // Sync auth state to Redux
  useEffect(() => {
    dispatch(setUser(user));
    dispatch(setProfile(user));
    dispatch(setLoading(isLoading));
  }, [user, isLoading, dispatch]);

  // Convert Supabase profile to app User
  const profileToUser = (profile: Profile): User => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    country: profile.country || undefined,
    age: profile.age || undefined,
    language: profile.language || undefined,
  });

  // Load user on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user);
      } else {
        setUserState(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile from Supabase
  const loadUserProfile = async (
    userId: string,
    fallbackUser?: SupabaseUser
  ) => {
    // setIsLoading(true); // Removed to avoid blocking UI during background updates
    try {
      console.log("Loading profile for user:", userId);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);

        // If profile doesn't exist, try to create it from user metadata
        // PGRST116 is the "not found" error code in Supabase
        if (
          fallbackUser &&
          (error.code === "PGRST116" || error.message?.includes("No rows"))
        ) {
          console.log("Profile not found, creating from user metadata");
          try {
            const userMetadata = fallbackUser.user_metadata || {};
            const newProfile = {
              id: userId,
              email: fallbackUser.email || "",
              full_name: userMetadata.full_name || userMetadata.fullName || "",
              role: (userMetadata.role || "doctor") as "doctor" | "patient",
              country: userMetadata.country || undefined,
              age: userMetadata.age || undefined,
              language: userMetadata.language || "de",
            };

            const { error: insertError } = await supabase
              .from("profiles")
              .insert(newProfile);

            if (insertError) {
              console.error("Error creating profile:", insertError);
              // Even if profile creation fails, set user from metadata
              setUserState({
                id: userId,
                email: fallbackUser.email || "",
                fullName: userMetadata.full_name || userMetadata.fullName || "",
                role: (userMetadata.role || "doctor") as "doctor" | "patient",
                country: userMetadata.country || undefined,
                age: userMetadata.age || undefined,
                language: userMetadata.language || "de",
              });
            } else {
              setUserState(profileToUser(newProfile as Profile));
            }
          } catch (createError) {
            console.error("Error creating profile from metadata:", createError);
            // Fallback: set user from metadata anyway
            if (fallbackUser) {
              const userMetadata = fallbackUser.user_metadata || {};
              setUserState({
                id: userId,
                email: fallbackUser.email || "",
                fullName: userMetadata.full_name || userMetadata.fullName || "",
                role: (userMetadata.role || "doctor") as "doctor" | "patient",
                country: userMetadata.country || undefined,
                age: userMetadata.age || undefined,
                language: userMetadata.language || "de",
              });
            }
          }
        } else {
          if (fallbackUser) {
            const userMetadata = fallbackUser.user_metadata || {};
            setUserState({
              id: userId,
              email: fallbackUser.email || "",
              fullName: userMetadata.full_name || userMetadata.fullName || "",
              role: (userMetadata.role || "doctor") as "doctor" | "patient",
              country: userMetadata.country || undefined,
              age: userMetadata.age || undefined,
              language: userMetadata.language || "de",
            });
          }
        }
        return;
      }

      if (profile) {
        console.log("Profile loaded:", profile);
        setUserState(profileToUser(profile as Profile));
      } else {
        if (fallbackUser) {
          const userMetadata = fallbackUser.user_metadata || {};
          setUserState({
            id: userId,
            email: fallbackUser.email || "",
            fullName: userMetadata.full_name || userMetadata.fullName || "",
            role: (userMetadata.role || "doctor") as "doctor" | "patient",
            country: userMetadata.country || undefined,
            age: userMetadata.age || undefined,
            language: userMetadata.language || "de",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      if (fallbackUser) {
        const userMetadata = fallbackUser.user_metadata || {};
        setUserState({
          id: userId,
          email: fallbackUser.email || "",
          fullName: userMetadata.full_name || userMetadata.fullName || "",
          role: (userMetadata.role || "doctor") as "doctor" | "patient",
          country: userMetadata.country || undefined,
          age: userMetadata.age || undefined,
          language: userMetadata.language || "de",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch(setLoggingIn(true));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch(setLoginError(error.message));
        return false;
      }

      if (data.user) {
        const userMetadata = data.user.user_metadata || {};
        setUserState({
          id: data.user.id,
          email: data.user.email || "",
          fullName: userMetadata.full_name || userMetadata.fullName || "",
          role: (userMetadata.role || "doctor") as "doctor" | "patient",
          country: userMetadata.country || undefined,
          age: userMetadata.age || undefined,
          language: userMetadata.language || "de",
        });
        dispatch(setLoggingIn(false));
        return true;
      }

      dispatch(setLoginError("No user data returned"));
      return false;
    } catch (error) {
      console.error("Login error:", error);
      dispatch(setLoginError(error instanceof Error ? error.message : "Login failed"));
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUserState(null);
      dispatch(logoutAction());
      dispatch(clearUserData());
      dispatch(clearConsultations());
      dispatch(clearAppointments());
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch(setRegistering(true));
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: "doctor", // Only doctors can register for now
            country: userData.country,
            age: userData.age,
            language: userData.language || "de",
          },
        },
      });

      if (authError) {
        dispatch(setRegisterError(authError.message));
        return false;
      }

      if (authData.user) {
        // Profile will be created automatically by trigger
        // But we can also manually update it with additional data
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            country: userData.country,
            age: userData.age,
            language: userData.language || "de",
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          // Continue anyway, profile was created by trigger
        }

        await loadUserProfile(authData.user.id, authData.user);
        dispatch(setRegistering(false));
        return true;
      }

      dispatch(setRegisterError("No user data returned"));
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      dispatch(setRegisterError(error instanceof Error ? error.message : "Registration failed"));
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
