// Application Constants
export const APP_CONFIG = {
  NAME: 'SurveyDU',
  VERSION: '1.0.0',
  DESCRIPTION: 'A comprehensive survey platform for educational institutions',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ADMIN: 'Admin',
} as const;

// Question Types (from API)
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SINGLE_ANSWER: 'single_answer',
  OPEN_TEXT: 'open_text',
  PERCENTAGE: 'percentage',
} as const;

// Question Type Labels (for display)
export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.SINGLE_ANSWER]: 'Single Answer',
  [QUESTION_TYPES.OPEN_TEXT]: 'Open Text',
  [QUESTION_TYPES.PERCENTAGE]: 'Rating Scale (1-5)',
} as const;

// Survey Status
export const SURVEY_STATUS = {
  Draft: 0,
  Active: 1,
  Completed: 2,
  Inactive: 3,
  Expired: 4,
} as const;

// Survey Status Labels (for display)
export const SURVEY_STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  inactive: 'Inactive',
  expired: 'Expired',
} as const;

// Comment Status
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = {
  STUDENT: [
    { title: 'Dashboard', href: '/dashboard/student' },
    { title: 'Surveys', href: '/dashboard/student/surveys' },
    { title: 'Profile', href: '/dashboard/student/profile' },
  ],
  TEACHER: [
    { title: 'Dashboard', href: '/dashboard/teacher' },
    { title: 'Create Survey', href: '/dashboard/teacher/create-survey' },
    { title: 'Surveys', href: '/dashboard/teacher/surveys' },
    { title: 'Profile', href: '/dashboard/teacher/profile' },
  ],
  ADMIN: [
    { title: 'Dashboard', href: '/dashboard/admin' },
    { title: 'Users', href: '/dashboard/admin/users' },
    { title: 'Surveys', href: '/dashboard/admin/surveys' },
    { title: 'Profile', href: '/dashboard/admin/profile' },
  ],
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  PASSWORD: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  STUDENT_ID: {
    pattern: /^[A-Z0-9]{6,10}$/,
    message: 'Student ID must be 6-10 characters (letters and numbers only)',
  },
  TEACHER_ID: {
    pattern: /^[A-Z0-9]{6,10}$/,
    message: 'Teacher ID must be 6-10 characters (letters and numbers only)',
  },
  PHONE: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language
export const LANGUAGE = {
  EN: 'en',
  AR: 'ar',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_STUDENT_ID: 'Please enter a valid student ID',
  INVALID_TEACHER_ID: 'Please enter a valid teacher ID',
  INVALID_PHONE: 'Please enter a valid phone number',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Invalid file type',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  SURVEY_CREATED: 'Survey created successfully',
  SURVEY_UPDATED: 'Survey updated successfully',
  SURVEY_DELETED: 'Survey deleted successfully',
  RESPONSE_SUBMITTED: 'Response submitted successfully',
  COMMENT_CREATED: 'Comment created successfully',
  COMMENT_APPROVED: 'Comment approved successfully',
  COMMENT_REJECTED: 'Comment rejected successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
} as const;

// Enum equivalents
export const TARGET_GENDER = {
  Male: 0,
  Female: 1,
  All: 2,
} as const;

export const GENDERS = [
  { value: TARGET_GENDER.Male, label: "Male" },
  { value: TARGET_GENDER.Female, label: "Female" },
];

export const ACADEMIC_YEARS = [
  { value: 1, label: "First" },
  { value: 2, label: "Second" },
  { value: 3, label: "Third" },
  { value: 4, label: "Fourth" },
  { value: 5, label: "Fifth" },
];

// For select components (with 'All' choice)
export const TARGET_GENDER_SELECT = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const ACADEMIC_YEARS_SELECT = [
  { value: 'all', label: 'All' },
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  { value: 5, label: 'Fifth' },
];

 