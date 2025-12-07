import { create } from 'zustand';
import { usersApi, alumniApi, studentsApi } from '../api';

export const useUsersStore = create()((set, get) => ({
  users: [],
  alumni: [],
  students: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isLoading: false, error: 'Not authenticated' });
      return;
    }
    try {
      if (process.env.NODE_ENV === 'development') {
        try { console.debug('[fetchUsers] server baseURL:', (await import('../api-client')).default.defaults?.baseURL); } catch (e) { }
      }
      const response = await usersApi.getAll();
      if (process.env.NODE_ENV === 'development') console.debug('[fetchUsers] response url', response.config?.url, response.status);
      set({ users: response.data.data || [], isLoading: false });
    } catch (error) {
      console.error('fetchUsers error', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  fetchAlumni: async () => {
    set({ isLoading: true, error: null });
    try {
      if (process.env.NODE_ENV === 'development') {
        try { console.debug('[fetchAlumni] server baseURL:', (await import('../api-client')).default.defaults?.baseURL); } catch (e) { }
      }
      const response = await alumniApi.getAll();
      if (process.env.NODE_ENV === 'development') console.debug('[fetchAlumni] response url', response.config?.url, response.status);
      set({ alumni: response.data.data || [], isLoading: false });
    } catch (error) {
      console.error('fetchAlumni error', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch alumni',
        isLoading: false,
      });
    }
  },

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      if (process.env.NODE_ENV === 'development') {
        try { console.debug('[fetchStudents] server baseURL:', (await import('../api-client')).default.defaults?.baseURL); } catch (e) { }
      }
      const response = await studentsApi.getAll();
      if (process.env.NODE_ENV === 'development') console.debug('[fetchStudents] response url', response.config?.url, response.status);
      set({ students: response.data.data || [], isLoading: false });
    } catch (error) {
      console.error('fetchStudents error', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch students',
        isLoading: false,
      });
    }
  },

  verifyAlumni: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await alumniApi.verify(id);
      // Refresh alumni list
      await get().fetchAlumni();
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to verify alumni',
        isLoading: false,
      });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete user',
        isLoading: false,
      });
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
  clearError: () => set({ error: null }),
}));
