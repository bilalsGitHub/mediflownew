"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Profile interface (Supabase'den gelen)
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "doctor" | "patient";
  country?: string;
  age?: number;
  language?: string;
  created_at: string;
  updated_at: string;
}

// User interface (app için)
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "doctor" | "patient";
  country?: string;
  age?: number;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  country?: string;
  age?: number;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        // Don't await - let it run in background
        loadUserProfile(session.user.id, session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Don't await - let it run in background to avoid blocking auth flow
        loadUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
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
              setUser({
                id: userId,
                email: fallbackUser.email || "",
                fullName: userMetadata.full_name || userMetadata.fullName || "",
                role: (userMetadata.role || "doctor") as "doctor" | "patient",
                country: userMetadata.country || undefined,
                age: userMetadata.age || undefined,
                language: userMetadata.language || "de",
              });
            } else {
              // Profile created, set user
              setUser(profileToUser(newProfile as Profile));
            }
          } catch (createError) {
            console.error("Error creating profile from metadata:", createError);
            // Fallback: set user from metadata anyway
            if (fallbackUser) {
              const userMetadata = fallbackUser.user_metadata || {};
              setUser({
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
          // Other error or no fallback user - set user from metadata if available
          if (fallbackUser) {
            const userMetadata = fallbackUser.user_metadata || {};
            setUser({
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
        setUser(profileToUser(profile as Profile));
      } else {
        console.warn("No profile data returned");
        // Fallback to metadata if available
        if (fallbackUser) {
          const userMetadata = fallbackUser.user_metadata || {};
          setUser({
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
      // Fallback to metadata if available
      if (fallbackUser) {
        const userMetadata = fallbackUser.user_metadata || {};
        setUser({
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
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return false;
      }

      if (data.user) {
        console.log(
          "Login successful, setting user optimistically:",
          data.user.id
        );

        // Optimistically set user from metadata to unblock UI immediately
        const userMetadata = data.user.user_metadata || {};
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          fullName: userMetadata.full_name || userMetadata.fullName || "",
          role: (userMetadata.role || "doctor") as "doctor" | "patient",
          country: userMetadata.country || undefined,
          age: userMetadata.age || undefined,
          language: userMetadata.language || "de",
        });

        return true;
      }

      console.warn("Login succeeded but no user data returned");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth
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
        console.error("Registration error:", authError);
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

        // Auto login after registration
        await loadUserProfile(authData.user.id, authData.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
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
