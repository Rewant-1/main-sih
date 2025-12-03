import { create } from 'zustand';
import type { Connection } from '../types';
import { connectionsApi } from '../api';

interface ConnectionsState {
  connections: Connection[];
  pendingRequests: Connection[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConnections: () => Promise<void>;
  sendRequest: (alumniId: string) => Promise<void>;
  acceptRequest: (connectionId: string) => Promise<void>;
  rejectRequest: (connectionId: string) => Promise<void>;
  clearError: () => void;
}

export const useConnectionsStore = create<ConnectionsState>()((set, get) => ({
  connections: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await connectionsApi.getAll();
      const allConnections = response.data.data || [];
      set({
        connections: allConnections.filter((c) => c.status === 'accepted'),
        pendingRequests: allConnections.filter((c) => c.status === 'pending'),
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch connections',
        isLoading: false,
      });
    }
  },

  sendRequest: async (alumniId: string) => {
    set({ isLoading: true, error: null });
    try {
      await connectionsApi.sendRequest(alumniId);
      await get().fetchConnections();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to send request',
        isLoading: false,
      });
      throw error;
    }
  },

  acceptRequest: async (connectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await connectionsApi.acceptRequest(connectionId);
      await get().fetchConnections();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to accept request',
        isLoading: false,
      });
      throw error;
    }
  },

  rejectRequest: async (connectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await connectionsApi.rejectRequest(connectionId);
      await get().fetchConnections();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to reject request',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
