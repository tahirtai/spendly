import { create } from 'zustand';
import { supabaseBrowser } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  workspaceId?: string | null;
  workspaceName?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  /** True while the app is restoring the existing Supabase session on startup. */
  isInitializing: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  /** Called once on app startup — restores the existing Supabase session if valid. */
  checkSession: () => Promise<void>;
}

const SAVED_USER_KEY = 'spendly_auth_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(SAVED_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  // ── Supabase auth state listener ─────────────────────────────────────────
  // Registered once at store creation.  Keeps Zustand in sync with Supabase
  // session events: silent token refresh, cross-tab sign-out, etc.
  supabaseBrowser.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && session) {
      // Supabase silently refreshed the access token — update the mirror value.
      set({ accessToken: session.access_token });
    } else if (event === 'SIGNED_OUT' || !session) {
      // Session terminated (explicit logout or cross-tab sign-out).
      localStorage.removeItem(SAVED_USER_KEY);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  });

  return {
    // Fast initial paint: show the stored name/avatar while checkSession runs.
    user: getStoredUser(),
    // Do NOT use a stale localStorage token as the authoritative value —
    // checkSession will populate this from the live Supabase session.
    accessToken: null,
    isAuthenticated: false,   // Confirmed by checkSession, not assumed from localStorage.
    isInitializing: true,     // Prevents protected routes from rendering before session check.

    // ── setUser ─────────────────────────────────────────────────────────────
    // Stores the Spendly user profile in state and localStorage.
    // If `token` is undefined, the existing accessToken in the store is preserved.
    setUser: (user, token = undefined) => {
      if (user) {
        localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SAVED_USER_KEY);
      }
      // Preserve the current token when only the user profile is being updated.
      const resolvedToken =
        token !== undefined ? token : get().accessToken;

      set({
        user,
        accessToken: resolvedToken ?? null,
        isAuthenticated: !!user,
      });
    },

    // ── logout ───────────────────────────────────────────────────────────────
    // Clears Zustand state immediately (synchronous), then fires Supabase
    // signOut in the background to revoke the refresh token server-side.
    logout: () => {
      localStorage.removeItem(SAVED_USER_KEY);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      // Fire-and-forget: local state is already cleared above.
      // Supabase will also remove its own localStorage entry (spendly_sb_session).
      supabaseBrowser.auth.signOut().catch(() => {
        // Ignore network errors — the local session has already been cleared.
      });
    },

    // ── checkSession ─────────────────────────────────────────────────────────
    // Called once on app startup.
    // 1. Asks Supabase for the stored session.
    // 2. If the access token is expired but the refresh token is valid,
    //    Supabase automatically refreshes it before returning the session.
    // 3. Sets isAuthenticated + accessToken from the confirmed-live session.
    // 4. Sets isInitializing:false so protected routes can render.
    checkSession: async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseBrowser.auth.getSession();

        if (error || !session) {
          // No valid session — user must log in.
          localStorage.removeItem(SAVED_USER_KEY);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isInitializing: false,
          });
          return;
        }

        // Valid session — Supabase already refreshed if needed.
        const storedUser = getStoredUser();
        set({
          user: storedUser,
          accessToken: session.access_token,
          isAuthenticated: !!storedUser,
          isInitializing: false,
        });
      } catch {
        // Unexpected error — fail safely.
        localStorage.removeItem(SAVED_USER_KEY);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    },
  };
});
