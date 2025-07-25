import api from '@/lib/api/axios';
import { LoginRequest, LoginResponse, User } from '@/lib/types';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/Auth/login', credentials);
      const { token, expiration, userId, email, userType } = response.data;
      
      // Create user object
      const user: User = {
        userId,
        email,
        userType,
        token,
        expiration
      };
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Save token in cookie (expires with token)
      if (typeof document !== 'undefined') {
        const expires = new Date(expiration).toUTCString();
        document.cookie = `token=${token}; expires=${expires}; path=/`;
        document.cookie = `role=${userType}; expires=${expires}; path=/`;
      }
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid request. Please check your input.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Login failed. Please try again.');
      }
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove token cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user: User = JSON.parse(userStr);
      // Check if token is expired
      if (new Date(user.expiration) < new Date()) {
        this.logout();
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.logout();
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get token
  static getToken(): string | null {
    return localStorage.getItem('token');
  }
} 