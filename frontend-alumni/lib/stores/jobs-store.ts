import { create } from 'zustand';
import type { Job, CreateJobData } from '../types';
import { jobsApi } from '../api';

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (data: CreateJobData) => Promise<void>;
  applyToJob: (id: string) => Promise<void>;
  setSelectedJob: (job: Job | null) => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>()((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await jobsApi.getAll();
      set({ jobs: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch jobs',
        isLoading: false,
      });
    }
  },

  createJob: async (data: CreateJobData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jobsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          jobs: [...state.jobs, response.data.data!],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to create job',
        isLoading: false,
      });
      throw error;
    }
  },

  applyToJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await jobsApi.apply(id);
      set({ isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to apply to job',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),
  clearError: () => set({ error: null }),
}));
