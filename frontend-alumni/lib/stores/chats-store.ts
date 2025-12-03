import { create } from 'zustand';
import type { Chat } from '../types';
import { chatApi, messagesApi } from '../api';

interface ChatsState {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChats: () => Promise<void>;
  getChat: (id: string) => Promise<void>;
  createChat: (userId: string) => Promise<Chat>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  clearError: () => void;
}

export const useChatsStore = create<ChatsState>()((set, get) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  error: null,

  fetchChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getAll();
      set({ chats: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch chats',
        isLoading: false,
      });
    }
  },

  getChat: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getById(id);
      set({ activeChat: response.data.data || null, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to get chat',
        isLoading: false,
      });
    }
  },

  createChat: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Create chat with the other user - the API will determine if it's alumni or student
      const response = await chatApi.create({ alumniId: userId, studentId: userId });
      const newChat = response.data.data!;
      set((state) => ({
        chats: [...state.chats, newChat],
        activeChat: newChat,
        isLoading: false,
      }));
      return newChat;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to create chat',
        isLoading: false,
      });
      throw error;
    }
  },

  sendMessage: async (chatId: string, message: string) => {
    try {
      await messagesApi.create({ chatId, message });
      await get().getChat(chatId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to send message',
      });
      throw error;
    }
  },

  setActiveChat: (chat) => set({ activeChat: chat }),
  clearError: () => set({ error: null }),
}));
