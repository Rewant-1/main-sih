// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'Student' | 'Alumni';
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
  phone?: string;
  graduationYear: number;
  course?: string;
  currentCompany?: string;
  jobTitle?: string;
  industry?: string;
  bio?: string;
}

export interface RegisterStudentData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  enrollmentYear?: number;
  expectedGraduation?: number;
  course?: string;
  rollNumber?: string;
}

// Alumni Types
export interface Alumni {
  _id: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  isVerified?: boolean;
  graduationYear?: number;
  course?: string;
  currentCompany?: string;
  jobTitle?: string;
  industry?: string;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  degreeUrl?: string;
}

export interface AlumniWithUser extends Alumni {
  user?: User;
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
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  enrollmentYear?: number;
  expectedGraduation?: number;
  rollNumber?: string;
  academic?: StudentAcademic;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

export interface StudentWithUser extends Student {
  user?: User;
}

// Job Types
export interface JobApplication {
  studentId: string;
  appliedAt: string;
  status?: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  skillsRequired?: string[];
  postedBy?: User | Alumni | string;
  applications?: JobApplication[];
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  venue?: string;
  type?: string;
  organizer?: User;
  createdBy?: string | User;
  registeredUsers?: Array<string | User>;
  createdAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  venue?: string;
  type?: string;
}

// Post Types
export interface PostComment {
  _id?: string;
  user?: string | User;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  author?: User;
  postedBy?: string | User;
  likes?: string[];
  comments?: PostComment[];
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  image?: string;
}

// Connection Types
export interface Connection {
  _id: string;
  userId?: User;
  connectionId?: User;
  studentId?: string | Student;
  alumniId?: string | Alumni;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'pending' | 'accepted';
  connectionDate?: string;
  createdAt?: string;
}

// Chat Types
export interface Message {
  _id?: string;
  senderId?: string;
  content: string;
  timestamp?: string;
  createdAt?: string;
}

export interface ChatMessage {
  sender: 'student' | 'alumni';
  message: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  participants?: Array<string | User>;
  alumniId?: string | Alumni;
  studentId?: string | Student;
  messages?: Message[];
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
  token: string;
  user: User;
  profile?: Alumni | Student;
}

// Success Story Types
export interface SuccessStory {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  alumniId?: string | Alumni;
  alumniName?: string;
  alumniDesignation?: string;
  alumniCompany?: string;
  graduationYear?: number;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  status: 'draft' | 'pending' | 'published' | 'archived';
  isFeatured?: boolean;
  views?: number;
  likes?: string[];
  shares?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuccessStoryData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  tags?: string[];
}

// Survey Types
export interface SurveyQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'mcq' | 'checkbox' | 'rating' | 'date';
  question: string;
  options?: string[];
  required?: boolean;
  maxRating?: number;
}

export interface SurveyResponse {
  respondentId: string;
  respondentType: 'alumni' | 'student';
  answers: {
    questionId: string;
    answer: string | string[] | number;
  }[];
  submittedAt: string;
}

export interface Survey {
  _id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  targetAudience: 'all' | 'alumni' | 'students';
  isActive: boolean;
  expiresAt?: string;
  responses?: SurveyResponse[];
  createdBy?: string;
  createdAt: string;
}

// Campaign Types
export interface CampaignMilestone {
  title: string;
  targetAmount: number;
  description?: string;
  reached: boolean;
  reachedAt?: string;
}

export interface CampaignDonation {
  donorId: string;
  donorType: 'alumni' | 'student' | 'other';
  amount: number;
  donorName?: string;
  message?: string;
  isAnonymous: boolean;
  donatedAt: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  category: string;
  coverImage?: string;
  images?: string[];
  milestones?: CampaignMilestone[];
  donations?: CampaignDonation[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationData {
  amount: number;
  message?: string;
  isAnonymous?: boolean;
}
