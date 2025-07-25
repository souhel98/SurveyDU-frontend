// Auth Types
export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  userId: string;
  email: string;
  userType: string;
}

export interface User {
  userId: string;
  email: string;
  userType: string;
  token: string;
  expiration: string;
}

// Registration Types
export interface StudentRegistrationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  phoneNumber?: string;
}

export interface TeacherRegistrationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  department: string;
  phoneNumber?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
    userType: string;
  };
  error?: string;
}

// User Management Types
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'Student' | 'Teacher' | 'Admin';
  phoneNumber?: string;
  department?: string;
  studentId?: string;
  teacherId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  studentId?: string;
  teacherId?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: User | UserProfile;
  error?: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data?: User[];
  error?: string;
}

// Survey Types
export interface Survey {
  id?: number;
  title: string;
  description?: string;
  questions: Question[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface Question {
  id?: number;
  text: string;
  type: 'SingleLineInput' | 'LongText' | 'RadioButtonGroup' | 'Checkboxes' | 'Dropdown' | 'MultiSelectDropdown' | 'RatingScale' | 'YesNo';
  options?: string[];
  required?: boolean;
  order?: number;
}

export interface SurveyResponse {
  success: boolean;
  message: string;
  data?: Survey;
  error?: string;
}

export interface SurveyListResponse {
  success: boolean;
  message: string;
  data?: Survey[];
  error?: string;
}

// Comment Types
export interface Comment {
  id: number;
  surveyId: number;
  userId: string;
  userEmail: string;
  userName: string;
  content: string;
  isApproved: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CreateCommentRequest {
  surveyId: number;
  content: string;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data?: Comment;
  error?: string;
}

export interface CommentListResponse {
  success: boolean;
  message: string;
  data?: Comment[];
  error?: string;
}

// Common Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Navigation Types
export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | undefined;
  };
}

// Analytics Types
export interface SurveyAnalytics {
  surveyId: number;
  totalResponses: number;
  completionRate: number;
  averageTimeToComplete: number;
  questionAnalytics: QuestionAnalytics[];
  responseTrends: ResponseTrend[];
  demographics?: Demographics;
}

export interface QuestionAnalytics {
  questionId: number;
  questionText: string;
  questionType: string;
  responseCount: number;
  responses: any[];
  charts?: ChartData[];
}

export interface ResponseTrend {
  date: string;
  responseCount: number;
}

export interface Demographics {
  ageGroups?: { [key: string]: number };
  departments?: { [key: string]: number };
  userTypes?: { [key: string]: number };
}

export interface ChartData {
  type: 'pie' | 'bar' | 'line';
  data: any[];
  options?: any;
} 