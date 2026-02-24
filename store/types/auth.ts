/**
 * Auth and user types. Single source of truth for the auth slice and userData slice:
 * User, Profile, RegisterData, UserPreferences.
 */
export type UserRole = "doctor" | "patient";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  country?: string;
  age?: number;
  language?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  country?: string;
  age?: number;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  country?: string;
  age?: number;
  language?: string;
}

export interface UserPreferences {
  language?: string;
  theme?: string;
  notifications?: boolean;
}
