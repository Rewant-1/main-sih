import { create } from 'zustand';
import type { User, Alumni, Student } from '../types';
import { usersApi, alumniApi, studentsApi } from '../api';

interface UsersState {
  users: User[];
  alumni: Alumni[];
  students: Student[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchAlumni: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  verifyAlumni: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: [],
  alumni: [],
  students: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersApi.getAll();
      set({ users: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('fetchUsers error', error);
      set({
        error: err.response?.data?.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  fetchAlumni: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await alumniApi.getAll();
      set({ alumni: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('fetchAlumni error', error);
      set({
        error: err.response?.data?.message || 'Failed to fetch alumni',
        isLoading: false,
      });
    }
  },

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentsApi.getAll();
      set({ students: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('fetchStudents error', error);
      set({
        error: err.response?.data?.message || 'Failed to fetch students',
        isLoading: false,
      });
    }
  },

  verifyAlumni: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await alumniApi.verify(id);
      // Refresh alumni list
      await get().fetchAlumni();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to verify alumni',
        isLoading: false,
      });
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to delete user',
        isLoading: false,
      });
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
  clearError: () => set({ error: null }),
}));
