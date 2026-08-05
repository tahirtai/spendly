import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  workspaceId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const SAVED_USER_KEY = 'spendly_auth_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(SAVED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  setUser: (user) => {
    if (user) {
      localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SAVED_USER_KEY);
    }
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    localStorage.removeItem(SAVED_USER_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
