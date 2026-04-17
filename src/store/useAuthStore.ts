import { create } from 'zustand';

interface User {
  email: string;
  role: string;
  name?: string;
  id?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('rms_user') || 'null'),
  setUser: (user) => {
    localStorage.setItem('rms_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('rms_user');
    set({ user: null });
  },
}));
