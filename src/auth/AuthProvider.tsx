import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getCurrentSession,
  getCurrentUser,
  resetPasswordForEmail,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  updateUserPassword,
} from "./authService";
import { isSupabaseConfigured, supabaseConfigError, supabase } from "./supabaseClient";
import type { AuthContextValue, AuthUserProfile } from "./types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        if (!supabase) {
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        const activeSession = await getCurrentSession();
        const activeUser = await getCurrentUser();

        if (!mounted) return;
        setSession(activeSession);
        setUser(activeUser);
      } catch {
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadSession();

    const { data } = supabase
      ? supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
        })
      : { data: { subscription: null } };

    return () => {
      mounted = false;
      data.subscription?.unsubscribe();
    };
  }, []);

  const profile = useMemo<AuthUserProfile | null>(() => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName:
        user.user_metadata?.display_name ??
        user.user_metadata?.full_name ??
        null,
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isSupabaseConfigured,
      configError: supabaseConfigError,
      signUp: async (email, password, displayName) => {
        const result = await signUpWithEmail(email, password, displayName);
        return result;
      },
      signIn: async (email, password) => {
        const result = await signInWithEmail(email, password);
        return result;
      },
      signOut: async () => {
        const result = await signOutUser();
        setSession(null);
        setUser(null);
        return result;
      },
      getCurrentSession: async () => {
        const result = await getCurrentSession();
        setSession(result);
        return result;
      },
      getCurrentUser: async () => {
        const result = await getCurrentUser();
        setUser(result);
        return result;
      },
      resetPassword: async (email) => {
        const result = await resetPasswordForEmail(email);
        return result;
      },
      updatePassword: async (password) => {
        const result = await updateUserPassword(password);
        if (!result.error) {
          const refreshedUser = await getCurrentUser();
          setUser(refreshedUser);
        }
        return result;
      },
    }),
    [isLoading, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
