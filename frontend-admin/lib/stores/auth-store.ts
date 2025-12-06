import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Alumni, Student } from '../types';
import { authApi, usersApi } from '../api';

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
          if (process.env.NODE_ENV === 'development') console.debug('[auth-login] response', response?.status, response?.data);
          // API currently returns { success, data: { token } }; keep backward compatibility
          const extractedToken = response.data.token || response.data.data?.token;
          if (!extractedToken) {
            throw new Error('No token returned from server');
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', extractedToken);
          }

          // Try to decode token to fetch user profile
          let fetchedUser: User | null = response.data.user || response.data.data?.user || null;
          try {
            if (!fetchedUser) {
              const payload = JSON.parse(atob(extractedToken.split('.')[1] || '')) as { userId?: string; userType?: string };
              if (payload?.userId) {
                try {
                  // Try to fetch detailed user from the API using the token
                  const userResp = await usersApi.getById(payload.userId);
                  fetchedUser = userResp.data?.data as User;
                } catch (fetchErr) {
                  // If fetching fails (e.g. CORS, network, or 401), fallback to a minimal user object
                  console.warn('Failed to fetch user by id after login; using token payload as fallback', fetchErr);
                  fetchedUser = {
                    _id: payload.userId || 'unknown',
                    name: 'Admin',
                    email,
                    userType: (payload.userType as User['userType']) || 'Admin',
                    createdAt: new Date().toISOString(),
                  } as User;
                }
              } else if (payload?.userType) {
                // If token only contains userType (no userId), create a minimal user
                fetchedUser = {
                  _id: payload.userId || 'unknown',
                  name: 'Admin',
                  email,
                  userType: (payload.userType as User['userType']) || 'Admin',
                  createdAt: new Date().toISOString(),
                } as User;
              }
            }
          } catch (decodeErr) {
            console.warn('Failed to decode token for user info', decodeErr);
          }

          set({
            user: fetchedUser,
            profile: (response.data.profile as Alumni | Student | null) || null,
            token: extractedToken,
            isLoading: false,
          });

          // Debugging help: log the final auth details after login
          try {
            if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
              const masked = extractedToken ? `${extractedToken.slice(0, 6)}...` : 'null';
              console.debug('[auth-login] final auth state', {
                token: masked,
                user: fetchedUser,
              });
            }
          } catch { }
        } catch (error: unknown) {
          if (process.env.NODE_ENV === 'development') console.error('[auth-login] error', error);
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
