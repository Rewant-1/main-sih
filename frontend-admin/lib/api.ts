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
  Campaign,
  Survey,
  SuccessStory,
  Newsletter,
  LoginCredentials,
  RegisterAlumniData,
  CreateJobData,
  CreateEventData,
  CreatePostData,
  CreateCampaignData,
  CreateSurveyData,
  CreateSuccessStoryData,
  CreateNewsletterData,
  AuthResponse,
  ApiResponse,
  DashboardAnalytics,
} from './types';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  registerAlumni: (data: RegisterAlumniData) =>
    api.post<AuthResponse>('/auth/register/alumni', data),
  
  verifyAlumni: (alumniId: string) =>
    api.post<ApiResponse<Alumni>>(`/auth/verify/${alumniId}`, {}, {
      headers: { 'x-internal-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '' }
    }),
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
  verify: (alumniId: string) =>
    api.post<ApiResponse<Alumni>>(`/alumni/${alumniId}/verify`),
};

// Students API
export const studentsApi = {
  getAll: () => api.get<ApiResponse<Student[]>>('/students'),
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  // Note: Single student creation should use authApi.registerStudent or POST /auth/register/student
  bulkCreate: (students: Partial<Student>[]) =>
    api.post<ApiResponse<{ created: number; failed: unknown[] }>>('/students/bulk-create', { students }),
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

// Campaigns API
export const campaignsApi = {
  getAll: (params?: { status?: string; category?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ campaigns: Campaign[]; total: number; page: number; totalPages: number }>>('/campaigns', { params }),
  getById: (id: string) => api.get<ApiResponse<Campaign>>(`/campaigns/${id}`),
  create: (data: CreateCampaignData) => api.post<ApiResponse<Campaign>>('/campaigns', data),
  update: (id: string, data: Partial<Campaign>) =>
    api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/campaigns/${id}`),
  donate: (id: string, data: { amount: number; type?: string; message?: string; isAnonymous?: boolean }) =>
    api.post<ApiResponse<Campaign>>(`/campaigns/${id}/donate`, data),
  verify: (id: string) => api.post<ApiResponse<Campaign>>(`/campaigns/${id}/verify`),
  getAnalytics: () => api.get<ApiResponse<unknown>>('/campaigns/analytics'),
};

// Surveys API
export const surveysApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ surveys: Survey[]; total: number; page: number; totalPages: number }>>('/surveys', { params }),
  getById: (id: string) => api.get<ApiResponse<Survey>>(`/surveys/${id}`),
  create: (data: CreateSurveyData) => api.post<ApiResponse<Survey>>('/surveys', data),
  update: (id: string, data: Partial<Survey>) =>
    api.put<ApiResponse<Survey>>(`/surveys/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/surveys/${id}`),
  respond: (id: string, data: { answers: { questionId: string; answer: unknown }[] }) =>
    api.post<ApiResponse<Survey>>(`/surveys/${id}/respond`, data),
  getAnalytics: (id: string) => api.get<ApiResponse<unknown>>(`/surveys/${id}/analytics`),
  getOverallAnalytics: () => api.get<ApiResponse<unknown>>('/surveys/analytics'),
};

// Success Stories API
export const successStoriesApi = {
  getAll: (params?: { status?: string; category?: string; featured?: boolean; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ stories: SuccessStory[]; total: number; page: number; totalPages: number }>>('/success-stories', { params }),
  getById: (id: string) => api.get<ApiResponse<SuccessStory>>(`/success-stories/${id}`),
  create: (data: CreateSuccessStoryData) => api.post<ApiResponse<SuccessStory>>('/success-stories', data),
  update: (id: string, data: Partial<SuccessStory>) =>
    api.put<ApiResponse<SuccessStory>>(`/success-stories/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/success-stories/${id}`),
  like: (id: string) => api.post<ApiResponse<SuccessStory>>(`/success-stories/${id}/like`),
  verify: (id: string) => api.post<ApiResponse<SuccessStory>>(`/success-stories/${id}/verify`),
  getCategories: () => api.get<ApiResponse<{ _id: string; count: number }[]>>('/success-stories/categories'),
};

// Dashboard Analytics API
export const analyticsApi = {
  getDashboard: () => api.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard'),
  getAlumniStats: () => api.get<ApiResponse<unknown>>('/analytics/alumni'),
  getEngagement: () => api.get<ApiResponse<unknown>>('/analytics/engagement'),
  getTimeSeries: (params?: { startDate?: string; endDate?: string; interval?: string }) =>
    api.get<ApiResponse<unknown>>('/analytics/timeseries', { params }),
  getEventCounts: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<unknown>>('/analytics/events', { params }),
  getUserActivity: (userId: string) => api.get<ApiResponse<unknown>>(`/analytics/users/${userId}`),
  getFunnel: () => api.get<ApiResponse<unknown>>('/analytics/funnel'),
  getHeatmap: () => api.get<ApiResponse<unknown>>('/analytics/heatmap'),
  getSummary: () => api.get<ApiResponse<unknown>>('/analytics/summary'),
  generateSummary: () => api.post<ApiResponse<unknown>>('/analytics/summary/generate'),
  trackEvent: (data: { eventType: string; metadata?: Record<string, unknown> }) =>
    api.post<ApiResponse<unknown>>('/analytics/track', data),
  exportData: (format: 'csv' | 'pdf' | 'excel') => 
    api.get(`/analytics/export?format=${format}`, { responseType: 'blob' }),
};

// Audit Logs API
export const auditLogsApi = {
  getAll: (params?: { page?: number; limit?: number; action?: string; resourceType?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ logs: unknown[]; total: number; page: number; totalPages: number }>>('/audit-logs', { params }),
  getStats: () => api.get<ApiResponse<unknown>>('/audit-logs/stats'),
  getResourceHistory: (resourceType: string, resourceId: string) =>
    api.get<ApiResponse<unknown[]>>(`/audit-logs/resource/${resourceType}/${resourceId}`),
  getUserActivity: (userId: string) =>
    api.get<ApiResponse<unknown[]>>(`/audit-logs/user/${userId}`),
  cleanup: (olderThanDays: number) =>
    api.post<ApiResponse<{ deletedCount: number }>>('/audit-logs/cleanup', { olderThanDays }),
};

// Bulk Imports API
export const bulkImportsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ imports: unknown[]; total: number }>>('/bulk-imports', { params }),
  getTemplate: (importType: 'alumni' | 'students') =>
    api.get<ApiResponse<{ columns: string[] }>>(`/bulk-imports/template/${importType}`),
  getStatus: (importId: string) =>
    api.get<ApiResponse<unknown>>(`/bulk-imports/${importId}/status`),
  getResults: (importId: string) =>
    api.get<ApiResponse<unknown>>(`/bulk-imports/${importId}/results`),
  create: (file: File, importType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    return api.post<ApiResponse<unknown>>('/bulk-imports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  process: (importId: string) =>
    api.post<ApiResponse<unknown>>(`/bulk-imports/${importId}/process`),
  cancel: (importId: string) =>
    api.delete<ApiResponse<void>>(`/bulk-imports/${importId}`),
};

// Invitations API
export const invitationsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ invitations: unknown[]; total: number }>>('/invitations', { params }),
  getStats: () => api.get<ApiResponse<unknown>>('/invitations/stats'),
  create: (data: { email: string; name?: string; userType: 'Alumni' | 'Student'; expiresIn?: number }) =>
    api.post<ApiResponse<unknown>>('/invitations', data),
  createBulk: (invitations: { email: string; name?: string; userType: 'Alumni' | 'Student' }[]) =>
    api.post<ApiResponse<{ created: number; failed: unknown[] }>>('/invitations/bulk', { invitations }),
  resend: (invitationId: string) =>
    api.post<ApiResponse<unknown>>(`/invitations/${invitationId}/resend`),
  cancel: (invitationId: string) =>
    api.delete<ApiResponse<void>>(`/invitations/${invitationId}`),
  validateToken: (token: string) =>
    api.get<ApiResponse<unknown>>(`/invitations/validate/${token}`),
  acceptInvitation: (token: string, data: { password: string; name?: string }) =>
    api.post<ApiResponse<unknown>>(`/invitations/accept/${token}`, data),
};

// KYC API
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
  getPendingReviews: () => api.get<ApiResponse<unknown[]>>('/kyc/admin/pending'),
  getStats: () => api.get<ApiResponse<unknown>>('/kyc/admin/stats'),
  startReview: (kycId: string) => api.post<ApiResponse<unknown>>(`/kyc/${kycId}/review/start`),
  approve: (kycId: string, notes?: string) =>
    api.post<ApiResponse<unknown>>(`/kyc/${kycId}/approve`, { notes }),
  reject: (kycId: string, reason: string) =>
    api.post<ApiResponse<unknown>>(`/kyc/${kycId}/reject`, { reason }),
};

// Newsletters API
export const newslettersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ newsletters: Newsletter[]; total: number; page: number; totalPages: number }>>('/newsletters', { params }),
  getById: (id: string) => api.get<ApiResponse<Newsletter>>(`/newsletters/${id}`),
  create: (data: CreateNewsletterData) => api.post<ApiResponse<Newsletter>>('/newsletters', data),
  update: (id: string, data: Partial<Newsletter>) =>
    api.put<ApiResponse<Newsletter>>(`/newsletters/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/newsletters/${id}`),
  schedule: (id: string, scheduledAt: string) => 
    api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/schedule`, { scheduledAt }),
  send: (id: string) => api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/send`),
  getStats: () => api.get<ApiResponse<unknown>>('/newsletters/stats'),
};
