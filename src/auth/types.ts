import type { Session, User } from "@supabase/supabase-js";

export type AuthView = "login" | "signup" | "forgot" | "reset";

export type AuthUserProfile = {
  id: string;
  email?: string | null;
  displayName?: string | null;
};

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AuthUserProfile | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  configError: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>; 
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>; 
  signOut: () => Promise<{ error: Error | null }>; 
  getCurrentSession: () => Promise<Session | null>; 
  getCurrentUser: () => Promise<User | null>; 
  resetPassword: (email: string) => Promise<{ error: Error | null }>; 
  updatePassword: (password: string) => Promise<{ error: Error | null }>; 
};
