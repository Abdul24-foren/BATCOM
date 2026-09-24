import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "./supabaseClient";

function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ??
        "Supabase is not configured. Add the required environment variables.",
    );
  }
}

function normalizeAuthError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      return new Error("Invalid email or password.");
    }

    if (message.includes("email not confirmed") || message.includes("confirm your email")) {
      return new Error("Check your email and confirm your BATCOM account before signing in.");
    }

    if (message.includes("invalid email")) {
      return new Error("Please enter a valid email address.");
    }

    if (message.includes("weak password") || message.includes("password should be")) {
      return new Error("Choose a stronger password with at least 8 characters.");
    }

    if (message.includes("rate limit")) {
      return new Error("Too many attempts. Please wait a moment and try again.");
    }

    if (message.includes("network")) {
      return new Error("Network error. Please check your connection and try again.");
    }

    return new Error(error.message);
  }

  return new Error("Authentication failed. Please try again.");
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<{ error: Error | null; needsConfirmation: boolean }> {
  try {
    ensureSupabase();
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName ?? null,
          full_name: displayName ?? null,
        },
      },
    });

    if (error) {
      return { error: normalizeAuthError(error), needsConfirmation: false };
    }

    return {
      error: null,
      needsConfirmation: Boolean(data?.user && !data.session),
    };
  } catch (error) {
    return { error: normalizeAuthError(error), needsConfirmation: false };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: Error | null }> {
  try {
    ensureSupabase();
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    return { error: error ? normalizeAuthError(error) : null };
  } catch (error) {
    return { error: normalizeAuthError(error) };
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  try {
    ensureSupabase();
    const { error } = await supabase!.auth.signOut();
    return { error: error ? normalizeAuthError(error) : null };
  } catch (error) {
    return { error: normalizeAuthError(error) };
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    ensureSupabase();
    const { data, error } = await supabase!.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    ensureSupabase();
    const { data, error } = await supabase!.auth.getUser();
    if (error) {
      throw error;
    }
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function resetPasswordForEmail(
  email: string,
): Promise<{ error: Error | null }> {
  try {
    ensureSupabase();
    const redirectUrl = `${window.location.origin}`;
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error ? normalizeAuthError(error) : null };
  } catch (error) {
    return { error: normalizeAuthError(error) };
  }
}

export async function updateUserPassword(
  password: string,
): Promise<{ error: Error | null }> {
  try {
    ensureSupabase();
    const { error } = await supabase!.auth.updateUser({ password });
    return { error: error ? normalizeAuthError(error) : null };
  } catch (error) {
    return { error: normalizeAuthError(error) };
  }
}
