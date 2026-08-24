/**
 * Spendly Browser Supabase Client
 *
 * Uses only the public anon key — this is Supabase's "publishable" key,
 * explicitly designed for use in browsers and SPAs.
 *
 * Key settings:
 *   persistSession: true   → stores { access_token + refresh_token } in localStorage
 *   autoRefreshToken: true → silently refreshes the access token before it expires
 *
 * The server-side service_role key is NEVER used here.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Spendly] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Session persistence and automatic token refresh will not work.'
  );
}

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,            // Stores full session (access + refresh token)
    autoRefreshToken: true,          // Silently refreshes access token before expiry
    detectSessionInUrl: false,       // Not using OAuth redirect flows
    storageKey: 'spendly_sb_session', // Dedicated key — no conflict with other localStorage entries
  },
});
