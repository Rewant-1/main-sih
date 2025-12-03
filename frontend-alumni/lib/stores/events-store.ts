import { create } from 'zustand';
import type { Event, CreateEventData } from '../types';
import { eventsApi } from '../api';

interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEvents: () => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<void>;
  registerForEvent: (id: string) => Promise<void>;
  setSelectedEvent: (event: Event | null) => void;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.getAll();
      set({ events: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch events',
        isLoading: false,
      });
    }
  },

  createEvent: async (data: CreateEventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          events: [...state.events, response.data.data!],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to create event',
        isLoading: false,
      });
      throw error;
    }
  },

  registerForEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await eventsApi.register(id);
      await get().fetchEvents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to register for event',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
  clearError: () => set({ error: null }),
}));
