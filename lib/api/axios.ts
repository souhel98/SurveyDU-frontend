import axios from 'axios';
import { getApiConfig } from '@/lib/config/api-config';

const config = getApiConfig();

// Create axios instance
const api = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 