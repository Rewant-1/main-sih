import { create } from 'zustand';
import type { Post, CreatePostData } from '../types';
import { postsApi } from '../api';

interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  createPost: (data: CreatePostData) => Promise<void>;
  updatePost: (id: string, data: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  commentOnPost: (id: string, text: string) => Promise<void>;
  setSelectedPost: (post: Post | null) => void;
  clearError: () => void;
}

export const usePostsStore = create<PostsState>()((set, get) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.getAll();
      set({ posts: response.data.data || [], isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch posts',
        isLoading: false,
      });
    }
  },

  createPost: async (data: CreatePostData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.create(data);
      if (response.data.data) {
        set((state) => ({
          posts: [response.data.data!, ...state.posts],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to create post',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePost: async (id: string, data: Partial<Post>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.update(id, data);
      if (response.data.data) {
        set((state) => ({
          posts: state.posts.map((p) =>
            p._id === id ? response.data.data! : p
          ),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to update post',
        isLoading: false,
      });
      throw error;
    }
  },

  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await postsApi.delete(id);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to delete post',
        isLoading: false,
      });
    }
  },

  likePost: async (id: string) => {
    try {
      await postsApi.like(id);
      await get().fetchPosts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to like post',
      });
    }
  },

  commentOnPost: async (id: string, text: string) => {
    try {
      await postsApi.comment(id, text);
      await get().fetchPosts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to comment on post',
      });
      throw error;
    }
  },

  setSelectedPost: (post) => set({ selectedPost: post }),
  clearError: () => set({ error: null }),
}));
