import { create } from 'zustand';
import { jobsApi } from '../api';

export const useJobsStore = create()((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isLoading: false, error: 'Not authenticated' });
      return;
    }
    try {
      const response = await jobsApi.getAll();
      set({ jobs: response.data.data || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch jobs',
        isLoading: false,
      });
    }
  },

  createJob: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jobsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          jobs: [...state.jobs, response.data.data],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create job',
        isLoading: false,
      });
      throw error;
    }
  },

  updateJob: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jobsApi.update(id, data);
      if (response.data.data) {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j._id === id ? response.data.data : j
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update job',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteJob: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await jobsApi.delete(id);
      set((state) => ({
        jobs: state.jobs.filter((j) => j._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete job',
        isLoading: false,
      });
    }
  },

  applyToJob: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await jobsApi.apply(id);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to apply to job',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),
  clearError: () => set({ error: null }),
}));
