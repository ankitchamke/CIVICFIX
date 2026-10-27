// Supabase Client Initialization
// Connects to the hosted Supabase database when environment variables are set.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

let client = null;

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    client = null;
  }
}

export const supabase = client;
