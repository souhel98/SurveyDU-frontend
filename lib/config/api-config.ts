// API Configuration
export const API_CONFIG = {
  // Base URL for the ASP.NET Core backend nn
  BASE_URL: 'https://mhhmd6g0-001-site1.rtempurl.com/api',
  
  // Request timeout in milliseconds (2 minutes for longer operations like AI generation)
  TIMEOUT: 120000,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/Auth/login',
      REGISTER_STUDENT: '/auth/register/student',
      REGISTER_TEACHER: '/auth/register/teacher',
      CHECK_EMAIL: '/auth/check-email',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_VERIFICATION: '/auth/resend-verification',
    },
    
    // User Management
    USERS: {
      PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/change-password',
      ALL: '/users',
      BY_ID: (id: string) => `/users/${id}`,
    },
    
    // Surveys
    SURVEYS: {
      ALL: '/surveys',
      BY_ID: (id: number) => `/surveys/${id}`,
      RESPONSES: (id: number) => `/surveys/${id}/responses`,
      ANALYTICS: (id: number) => `/surveys/${id}/analytics`,
    },
    
    // Comments
    COMMENTS: {
      ALL: '/comments',
      BY_ID: (id: number) => `/comments/${id}`,
      BY_SURVEY: (surveyId: number) => `/comments/survey/${surveyId}`,
      PENDING: '/comments/pending',
      APPROVE: (id: number) => `/comments/${id}/approve`,
      REJECT: (id: number) => `/comments/${id}/reject`,
      STATISTICS: '/comments/statistics',
    },
  },
  
  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
    TIMEOUT_ERROR: 'Request timeout. The operation is taking longer than expected. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized. Please log in.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Invalid data. Please check your input.',
  },
} as const;

// Environment-specific configuration
export const getApiConfig = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // For development, allow HTTP if explicitly set
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL;
  
  // If in development and no explicit API URL is set, try to use HTTP for local backend
  if (isDevelopment && !process.env.NEXT_PUBLIC_API_URL) {
    // You can uncomment the line below if you have a local HTTP backend running
    // return { ...API_CONFIG, BASE_URL: 'http://localhost:5000/api' };
  }
  
  return {
    ...API_CONFIG,
    BASE_URL: baseUrl,
  };
}; 