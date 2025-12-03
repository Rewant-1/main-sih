import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Alumni, Student } from '../types';
import { authApi } from '../api';

interface AuthState {
  user: User | null;
  profile: Alumni | Student | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Alumni | Student | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { token, user, profile } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          set({
            user,
            profile: profile || null,
            token,
            isLoading: false,
          });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({
          user: null,
          profile: null,
          token: null,
        });
      },

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token,
      }),
    }
  )
);
