/**
 * Supabase Client Configuration
 * 
 * Optional cloud sync for journal entries
 */

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

/**
 * Sync journal entries to Supabase (optional feature)
 */
export async function syncJournalToCloud(entries: any[]): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Upload journal entries to Supabase
    const { error } = await supabase
      .from("journal_entries")
      .upsert(
        entries.map(entry => ({
          ...entry,
          user_id: user.id,
        }))
      );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch journal entries from Supabase (optional feature)
 */
export async function fetchJournalFromCloud(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign in with email (for cloud sync)
 */
export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign up with email (for cloud sync)
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign out (for cloud sync)
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
