import { create } from 'zustand';
import { postsApi } from '../api';

export const usePostsStore = create()((set, get) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isLoading: false, error: 'Not authenticated' });
      return;
    }
    try {
      const response = await postsApi.getAll();
      set({ posts: response.data.data || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch posts',
        isLoading: false,
      });
    }
  },

  createPost: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          posts: [response.data.data, ...state.posts],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create post',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePost: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.update(id, data);
      if (response.data.data) {
        set((state) => ({
          posts: state.posts.map((p) =>
            p._id === id ? response.data.data : p
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update post',
        isLoading: false,
      });
      throw error;
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await postsApi.delete(id);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete post',
        isLoading: false,
      });
    }
  },

  likePost: async (id) => {
    try {
      await postsApi.like(id);
      await get().fetchPosts();
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to like post',
      });
    }
  },

  commentOnPost: async (id, text) => {
    try {
      await postsApi.comment(id, text);
      await get().fetchPosts();
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to comment on post',
      });
      throw error;
    }
  },

  setSelectedPost: (post) => set({ selectedPost: post }),
  clearError: () => set({ error: null }),
}));
