import { create } from 'zustand';
import { eventsApi } from '../api';

export const useEventsStore = create()((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isLoading: false, error: 'Not authenticated' });
      return;
    }
    try {
      const response = await eventsApi.getAll();
      set({ events: response.data.data || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch events',
        isLoading: false,
      });
    }
  },

  createEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          events: [...state.events, response.data.data],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create event',
        isLoading: false,
      });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.update(id, data);
      if (response.data.data) {
        set((state) => ({
          events: state.events.map((e) =>
            e._id === id ? response.data.data : e
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update event',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await eventsApi.delete(id);
      set((state) => ({
        events: state.events.filter((e) => e._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete event',
        isLoading: false,
      });
    }
  },

  registerForEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await eventsApi.register(id);
      await get().fetchEvents();
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to register for event',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
  clearError: () => set({ error: null }),
}));
