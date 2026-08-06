/**
 * Spendly API Client
 * Centralized HTTP client that automatically attaches the JWT Authorization header
 * to every request. Frontend code NEVER calls fetch() directly — always uses apiFetch().
 */

const API_BASE = '/api';

function getToken(): string | null {
  try {
    return localStorage.getItem('spendly_auth_token');
  } catch {
    return null;
  }
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Generic JSON fetch wrapper with auth header injection */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers = buildHeaders(
    isFormData ? {} : { 'Content-Type': 'application/json' }
  );

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const data = await res.json().catch(() => ({ error: 'Invalid response from server.' }));

  if (!res.ok) {
    throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data.details);
  }

  return data as T;
}

/** Custom error class with status code and validation details */
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
