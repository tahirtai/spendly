/**
 * Spendly API Client
 *
 * Centralized HTTP client that automatically attaches the JWT Authorization
 * header to every request.  Frontend code NEVER calls fetch() directly —
 * always uses apiFetch() or the api.* convenience methods.
 *
 * Token strategy:
 *   - The access token is retrieved from the live Supabase session on every
 *     request, so the browser Supabase client's autoRefreshToken mechanism
 *     is always in effect.  We never read a stale token from localStorage.
 *
 * 401 retry:
 *   - On a first 401, we ask Supabase to refresh the session and retry once.
 *   - Auth endpoints (/auth/*) are never retried.
 *   - If the refresh also fails, we call logout() and throw.
 *   - No infinite loops: the retry is limited to a single attempt.
 */

import { supabaseBrowser } from './supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

/**
 * Returns the current valid access token from the live Supabase session.
 * If the session's access token is near-expiry, Supabase has already refreshed
 * it by the time getSession() returns (autoRefreshToken: true).
 * Falls back to localStorage for the rare case where the browser client is
 * unavailable (should never happen in production).
 */
async function getCurrentToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch {
    // Supabase client unavailable — fall back to the last known value.
  }
  try {
    return localStorage.getItem('spendly_auth_token');
  } catch {
    return null;
  }
}

/**
 * Internal fetch implementation.  The `retried` flag ensures that a 401
 * triggers at most one session-refresh + retry cycle.
 */
async function _apiFetch<T = any>(
  path: string,
  options: RequestInit,
  retried: boolean,
): Promise<T> {
  const token = await getCurrentToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const data = await res
    .json()
    .catch(() => ({ error: 'Invalid response from server.' }));

  if (!res.ok) {
    // ── 401 handling ──────────────────────────────────────────────────────
    // Attempt a session refresh + single retry, unless:
    //   • we already retried (avoids infinite loop)
    //   • the request is to an auth endpoint (login/register cannot use old token)
    if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
      try {
        const { data: { session } } = await supabaseBrowser.auth.refreshSession();
        if (session?.access_token) {
          // Got a fresh token — retry the original request once.
          return _apiFetch<T>(path, options, true);
        }
      } catch {
        // Refresh threw — fall through to logout.
      }

      // Refresh token exhausted or invalid — terminate the session.
      useAuthStore.getState().logout();
    }

    throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data.details);
  }

  return data as T;
}

/** Generic JSON fetch wrapper with auth header injection */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return _apiFetch<T>(path, options, false);
}

/** Custom error class with status code and optional Zod field details */
export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' }),

  post: <T = any>(path: string, body: object) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = any>(path: string, body: object) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T = any>(path: string, body: object) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),

  uploadFile: <T = any>(path: string, formData: FormData) =>
    apiFetch<T>(path, { method: 'POST', body: formData }),
};
