// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  // Backend may return Admin as well; keep union open for future roles
  userType: 'Student' | 'Alumni' | 'Admin' | string;
  profileDetails?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterAlumniData {
  name: string;
  email: string;
  password: string;
  graduationYear: number;
  degreeUrl: string;
}

export interface RegisterStudentData {
  name: string;
  email: string;
  password: string;
  degreeType: string;
  degreeName: string;
  entryDate?: string;
  expectedGraduationDate?: string;
}

// Alumni Types
export interface AlumniLocation {
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface Alumni {
  _id: string;
  userId: string | User;
  verified: boolean;
  graduationYear: number;
  degreeUrl: string;
  skills: string[];
  // Academic details
  degree?: 'B.Tech' | 'M.Tech' | 'MBA' | 'BBA' | 'B.Sc' | 'M.Sc' | 'Ph.D' | 'Other';
  department?: 'Computer Science' | 'Electronics' | 'Mechanical' | 'Civil' | 'Chemical' | 'Electrical' | 'IT' | 'Other';
  enrollmentNumber?: string;
  // Employment details
  employmentStatus?: 'employed' | 'self-employed' | 'freelancer' | 'student' | 'unemployed' | 'retired';
  currentCompany?: string;
  designation?: string;
  industry?: string;
  // Social links
  linkedIn?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
  // Location
  location?: AlumniLocation;
  // Contact
  phone?: string;
  // Profile tracking
  profileCompletion?: number;
}

export interface AlumniWithUser extends Omit<Alumni, 'userId'> {
  userId: User;
}

// Student Types
export interface StudentAcademic {
  entryDate: string;
  expectedGraduationDate?: string;
  degreeType: string;
  degreeName: string;
  isCompleted: boolean;
  completionDate?: string;
  currentYear: number;
}

export interface Student {
  _id: string;
  userId: string | User;
  academic: StudentAcademic;
}

export interface StudentWithUser extends Omit<Student, 'userId'> {
  userId: User;
}

// Job Types
export interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description?: string;
  skillsRequired: string[];
  postedBy: string | Alumni;
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description?: string;
  skillsRequired?: string[];
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  venue?: string;
  createdBy?: string | User;
  registeredUsers: string[] | User[];
  createdAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  venue?: string;
}

// Post Types
export interface PostComment {
  _id?: string;
  user: string | User;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  postedBy: string | User;
  likes: string[] | User[];
  comments: PostComment[];
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  image?: string;
}

// Connection Types
export interface Connection {
  _id: string;
  studentId: string | Student;
  alumniId: string | Alumni;
  status: 'pending' | 'accepted';
  connectionDate: string;
}

// Chat Types
export interface ChatMessage {
  sender: 'student' | 'alumni';
  message: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  alumniId: string | Alumni;
  studentId: string | Student;
  messages: ChatMessage[];
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  // Newer API returns data.token; older code may return token at root
  token?: string;
  user?: User;
  profile?: Alumni | Student;
  data?: {
    token?: string;
    user?: User;
    profile?: Alumni | Student;
  };
  message?: string;
}

// Campaign Types
export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Donation {
  _id?: string;
  donor: string | User;
  amount: number;
  type: 'money' | 'skills' | 'resources';
  message?: string;
  isAnonymous: boolean;
  transactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Campaign {
  _id: string;
  title: string;
  tagline?: string;
  description: string;
  category: 'infrastructure' | 'scholarship' | 'research' | 'sustainability' | 'sports' | 'general' | 'other';
  subcategory?: string;
  targetAmount: number;
  raisedAmount: number;
  minimumDonation: number;
  currency: string;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  donations: Donation[];
  supportersCount: number;
  beneficiaries?: string;
  expectedOutcomes: string[];
  impactDescription?: string;
  coverImage?: string;
  images: string[];
  videoUrl?: string;
  organizer: string | User;
  teamMembers: { user: string | User; role: string }[];
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  isVerified: boolean;
  views: number;
  shares: number;
  progress?: number;
  daysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  title: string;
  tagline?: string;
  description: string;
  category: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  beneficiaries?: string;
  expectedOutcomes?: string[];
  coverImage?: string;
}

// Survey Types
export interface SurveyQuestion {
  _id?: string;
  text: string;
  type: 'short' | 'long' | 'multiple_choice' | 'single_choice' | 'rating' | 'date';
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface SurveyResponse {
  _id?: string;
  respondent?: string | User;
  answers: { questionId: string; answer: unknown }[];
  completedAt: string;
  timeSpent?: number;
  device?: string;
}

export interface Survey {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  targetAudience: 'all' | 'alumni' | 'students' | 'specific_batch' | 'specific_department';
  targetBatch?: number;
  targetDepartment?: string;
  startDate?: string;
  endDate?: string;
  isScheduled: boolean;
  theme: { primaryColor: string; backgroundColor: string };
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  showResults: boolean;
  status: 'draft' | 'active' | 'closed' | 'archived';
  createdBy: string | User;
  responseCount?: number;
  completionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyData {
  title: string;
  description?: string;
  questions: Omit<SurveyQuestion, '_id'>[];
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  isAnonymous?: boolean;
}

// Success Story Types
export interface SuccessStory {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: 'academic_excellence' | 'career_growth' | 'entrepreneurship' | 'research_innovation' | 'social_impact' | 'other';
  alumni?: string | Alumni;
  alumniName?: string;
  alumniDesignation?: string;
  alumniCompany?: string;
  graduationYear?: number;
  coverImage?: string;
  images: string[];
  videoUrl?: string;
  tags: string[];
  views: number;
  likes: string[] | User[];
  shares: number;
  status: 'draft' | 'pending' | 'published' | 'archived';
  isFeatured: boolean;
  isVerified: boolean;
  createdBy: string | User;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuccessStoryData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  alumniName?: string;
  alumniDesignation?: string;
  alumniCompany?: string;
  graduationYear?: number;
  coverImage?: string;
  tags?: string[];
}

// Analytics Types
export interface DashboardAnalytics {
  totalAlumni: number;
  verifiedAlumni: number;
  totalStudents: number;
  totalJobs: number;
  totalEvents: number;
  totalCampaigns: number;
  totalDonations: number;
  employmentRate: number;
  departmentDistribution: { _id: string; count: number }[];
  graduationYearTrends: { _id: number; count: number }[];
  recentActivity: { type: string; count: number; date: string }[];
}

// Newsletter Types
export interface NewsletterRecipient {
  email: string;
  name?: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  unsubscribed: boolean;
}

export interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  content: string;
  preheader?: string;
  coverImage?: string;
  targetAudience: 'all' | 'alumni' | 'students' | 'specific_batch';
  targetBatch?: number;
  recipients: NewsletterRecipient[];
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
  unsubscribeRate?: number;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsletterData {
  title: string;
  subject: string;
  content: string;
  preheader?: string;
  coverImage?: string;
  targetAudience?: string;
  targetBatch?: number;
  scheduledAt?: string;
}
