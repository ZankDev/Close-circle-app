import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bifyhvuovoaqscowmktg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZnlodnVvdm9hcXNjb3dta3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTMyNTEsImV4cCI6MjA4ODI2OTI1MX0.l5wXGvjNIUvh8r_6rqpcjI8UeW1em1TJGE_hCWi2On4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Get the currently authenticated user's ID.
 * Returns null if not signed in.
 */
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

/**
 * Get the full current Supabase session (includes access_token, user, etc.)
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
