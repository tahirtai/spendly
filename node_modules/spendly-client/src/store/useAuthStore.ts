import { create } from 'zustand';

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
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

const SAVED_USER_KEY = 'spendly_auth_user';
const SAVED_TOKEN_KEY = 'spendly_auth_token';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(SAVED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(SAVED_TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialUser = getStoredUser();
const initialToken = getStoredToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: !!initialUser,
  setUser: (user, token = null) => {
    if (user) {
      localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
      if (token) localStorage.setItem(SAVED_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SAVED_USER_KEY);
      localStorage.removeItem(SAVED_TOKEN_KEY);
    }
    set({ user, accessToken: token, isAuthenticated: !!user });
  },
  logout: () => {
    localStorage.removeItem(SAVED_USER_KEY);
    localStorage.removeItem(SAVED_TOKEN_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
