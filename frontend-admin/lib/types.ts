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
export interface Alumni {
  _id: string;
  userId: string | User;
  verified: boolean;
  graduationYear: number;
  degreeUrl: string;
  skills: string[];
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
  type: 'full-time' | 'internship';
  description?: string;
  skillsRequired: string[];
  postedBy: string | Alumni;
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  type: 'full-time' | 'internship';
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
  token: string;
  user: User;
  profile?: Alumni | Student;
}
