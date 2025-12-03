import api from './api-client';
import type {
  User,
  Alumni,
  Student,
  Job,
  Event,
  Post,
  Connection,
  Chat,
  LoginCredentials,
  RegisterAlumniData,
  CreateJobData,
  CreateEventData,
  CreatePostData,
  AuthResponse,
  ApiResponse,
} from './types';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  registerAlumni: (data: RegisterAlumniData) =>
    api.post<AuthResponse>('/auth/register/alumni', data),
  
  verifyAlumni: (alumniId: string) =>
    api.post<ApiResponse<Alumni>>('/auth/verify/alumni', { alumniId }),
};

// Users API
export const usersApi = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/users/${id}`),
};

// Alumni API
export const alumniApi = {
  getAll: () => api.get<ApiResponse<Alumni[]>>('/alumni'),
  getById: (id: string) => api.get<ApiResponse<Alumni>>(`/alumni/${id}`),
  update: (id: string, data: Partial<Alumni>) =>
    api.put<ApiResponse<Alumni>>(`/alumni/${id}`, data),
  verify: (id: string) =>
    api.post<ApiResponse<Alumni>>('/auth/verify/alumni', { alumniId: id }),
};

// Students API
export const studentsApi = {
  getAll: () => api.get<ApiResponse<Student[]>>('/students'),
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: Partial<Student>) =>
    api.post<ApiResponse<Student>>('/students', data),
};

// Jobs API
export const jobsApi = {
  getAll: () => api.get<ApiResponse<Job[]>>('/jobs'),
  getById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),
  create: (data: CreateJobData) => api.post<ApiResponse<Job>>('/jobs', data),
  update: (id: string, data: Partial<Job>) =>
    api.put<ApiResponse<Job>>(`/jobs/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/jobs/${id}`),
  apply: (id: string) => api.post<ApiResponse<void>>(`/jobs/${id}/apply`),
};

// Events API
export const eventsApi = {
  getAll: () => api.get<ApiResponse<Event[]>>('/events'),
  getById: (id: string) => api.get<ApiResponse<Event>>(`/events/${id}`),
  create: (data: CreateEventData) =>
    api.post<ApiResponse<Event>>('/events', data),
  update: (id: string, data: Partial<Event>) =>
    api.put<ApiResponse<Event>>(`/events/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/events/${id}`),
  register: (id: string) =>
    api.post<ApiResponse<Event>>(`/events/${id}/register`),
};

// Posts API
export const postsApi = {
  getAll: () => api.get<ApiResponse<Post[]>>('/posts'),
  getById: (id: string) => api.get<ApiResponse<Post>>(`/posts/${id}`),
  create: (data: CreatePostData) => api.post<ApiResponse<Post>>('/posts', data),
  update: (id: string, data: Partial<Post>) =>
    api.put<ApiResponse<Post>>(`/posts/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/posts/${id}`),
  like: (id: string) => api.post<ApiResponse<Post>>(`/posts/${id}/like`),
  comment: (id: string, text: string) =>
    api.post<ApiResponse<Post>>(`/posts/${id}/comment`, { text }),
};

// Connections API
export const connectionsApi = {
  getAll: () => api.get<ApiResponse<Connection[]>>('/connections'),
  sendRequest: (alumniId: string) =>
    api.post<ApiResponse<Connection>>('/connections/send-request', { alumniId }),
  acceptRequest: (connectionId: string) =>
    api.post<ApiResponse<Connection>>('/connections/accept-request', {
      connectionId,
    }),
  rejectRequest: (connectionId: string) =>
    api.post<ApiResponse<Connection>>('/connections/reject-request', {
      connectionId,
    }),
};

// Chat API
export const chatApi = {
  getAll: () => api.get<ApiResponse<Chat[]>>('/chats'),
  getById: (id: string) => api.get<ApiResponse<Chat>>(`/chats/${id}`),
  create: (data: { alumniId?: string; studentId?: string }) =>
    api.post<ApiResponse<Chat>>('/chats', data),
  update: (id: string, data: Partial<Chat>) =>
    api.put<ApiResponse<Chat>>(`/chats/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/chats/${id}`),
};

// Messages API
export const messagesApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/messages'),
  getById: (id: string) => api.get<ApiResponse<unknown>>(`/messages/${id}`),
  create: (data: { chatId: string; message: string }) =>
    api.post<ApiResponse<unknown>>('/messages', data),
  update: (id: string, data: { text: string }) =>
    api.put<ApiResponse<unknown>>(`/messages/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/messages/${id}`),
};
