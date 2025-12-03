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
  RegisterStudentData,
  CreateJobData,
  CreateEventData,
  CreatePostData,
  AuthResponse,
  ApiResponse,
  SuccessStory,
  CreateSuccessStoryData,
  Survey,
  Campaign,
  CreateDonationData,
} from './types';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  registerAlumni: (data: RegisterAlumniData) =>
    api.post<AuthResponse>('/auth/register/alumni', data),
  
  registerStudent: (data: RegisterStudentData) =>
    api.post<AuthResponse>('/auth/register/student', data),
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
  getProfile: () => api.get<ApiResponse<Alumni>>('/alumni/profile'),
  update: (id: string, data: Partial<Alumni>) =>
    api.put<ApiResponse<Alumni>>(`/alumni/${id}`, data),
};

// Students API
export const studentsApi = {
  getAll: () => api.get<ApiResponse<Student[]>>('/students'),
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  getProfile: () => api.get<ApiResponse<Student>>('/students/profile'),
  create: (data: Partial<Student>) =>
    api.post<ApiResponse<Student>>('/students', data),
  update: (id: string, data: Partial<Student>) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),
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
  getMyPosted: () => api.get<ApiResponse<Job[]>>('/jobs/my/posted'),
  updateApplicationStatus: (jobId: string, applicationId: string, status: string) =>
    api.patch<ApiResponse<Job>>(`/jobs/${jobId}/application-status`, { applicationId, status }),
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

// Success Stories API
export const successStoriesApi = {
  getAll: (params?: Record<string, string | boolean>) =>
    api.get<ApiResponse<{ stories: SuccessStory[]; total: number }>>('/success-stories', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<SuccessStory>>(`/success-stories/${id}`),
  getFeatured: () =>
    api.get<ApiResponse<SuccessStory[]>>('/success-stories/featured'),
  create: (data: CreateSuccessStoryData) =>
    api.post<ApiResponse<SuccessStory>>('/success-stories', data),
  like: (id: string) =>
    api.post<ApiResponse<SuccessStory>>(`/success-stories/${id}/like`),
  share: (id: string) =>
    api.post<ApiResponse<SuccessStory>>(`/success-stories/${id}/share`),
};

// Surveys API
export const surveysApi = {
  getAll: (params?: Record<string, string | boolean>) =>
    api.get<ApiResponse<{ surveys: Survey[]; total: number }>>('/surveys', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Survey>>(`/surveys/${id}`),
  getActive: () =>
    api.get<ApiResponse<Survey[]>>('/surveys/active'),
  submitResponse: (id: string, answers: { questionId: string; answer: string | string[] | number }[]) =>
    api.post<ApiResponse<Survey>>(`/surveys/${id}/respond`, { answers }),
};

// Campaigns API
export const campaignsApi = {
  getAll: (params?: Record<string, string | boolean>) =>
    api.get<ApiResponse<{ campaigns: Campaign[]; total: number }>>('/campaigns', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Campaign>>(`/campaigns/${id}`),
  getActive: () =>
    api.get<ApiResponse<Campaign[]>>('/campaigns/active'),
  donate: (id: string, data: CreateDonationData) =>
    api.post<ApiResponse<Campaign>>(`/campaigns/${id}/donate`, data),
};

// Analytics Tracking API (for user behavior)
export const analyticsApi = {
  trackEvent: (data: { eventType: string; metadata?: Record<string, unknown> }) =>
    api.post<ApiResponse<unknown>>('/analytics/track', data),
  trackBatch: (events: { eventType: string; metadata?: Record<string, unknown> }[]) =>
    api.post<ApiResponse<unknown>>('/analytics/track/batch', { events }),
};

// KYC API (for alumni verification)
export const kycApi = {
  getMyKYC: () => api.get<ApiResponse<unknown>>('/kyc/me'),
  getById: (kycId: string) => api.get<ApiResponse<unknown>>(`/kyc/${kycId}`),
  submit: (data: FormData) =>
    api.post<ApiResponse<unknown>>('/kyc', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  resubmit: (kycId: string, data: FormData) =>
    api.put<ApiResponse<unknown>>(`/kyc/${kycId}/resubmit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addDocument: (kycId: string, document: File) => {
    const formData = new FormData();
    formData.append('document', document);
    return api.post<ApiResponse<unknown>>(`/kyc/${kycId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Invitations API (for accepting invitations)
export const invitationsApi = {
  validateToken: (token: string) =>
    api.get<ApiResponse<unknown>>(`/invitations/validate/${token}`),
  acceptInvitation: (token: string, data: { password: string; name?: string }) =>
    api.post<ApiResponse<unknown>>(`/invitations/accept/${token}`, data),
};
