import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Alumni, Student } from '../types';
import { authApi, alumniApi, studentsApi } from '../api';

export interface AuthState {
  user: User | null;
  profile: Alumni | Student | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  registerAlumni: (data: {
    name: string;
    email: string;
    password: string;
    graduationYear: number;
    degreeUrl?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Alumni | Student | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

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
            isAuthenticated: true,
          });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      registerAlumni: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.registerAlumni(data);
          const { token, user, profile } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          set({
            user,
            profile: profile || null,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          set({ isLoading: true });
          let profile = null;
          
          if (user.userType === 'Alumni') {
            const response = await alumniApi.getProfile();
            profile = response.data.data;
          } else {
            const response = await studentsApi.getProfile();
            profile = response.data.data;
          }
          
          set({ profile, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
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
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
