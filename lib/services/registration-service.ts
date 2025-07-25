import api from '@/lib/api/axios';
import { StudentRegistrationRequest, TeacherRegistrationRequest, RegistrationResponse } from '@/lib/types';

export class RegistrationService {
  // Register student
  static async registerStudent(studentData: any): Promise<any> {
    try {
      const response = await api.post('/Auth/register/student', studentData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }

  // Register teacher
  static async registerTeacher(teacherData: TeacherRegistrationRequest): Promise<RegistrationResponse> {
    try {
      const response = await api.post<RegistrationResponse>('/auth/register/teacher', teacherData);
      return response.data;
    } catch (error: any) {
      console.error('Error registering teacher:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid registration data. Please check your input.');
      } else if (error.response?.status === 409) {
        throw new Error('User with this email already exists.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Registration failed. Please try again.');
      }
    }
  }

  // Check if email exists
  static async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking email:', error);
      
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to check email. Please try again.');
      }
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying email:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid verification token.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Email verification failed. Please try again.');
      }
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      
      if (error.response?.status === 404) {
        throw new Error('User not found with this email address.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to resend verification email. Please try again.');
      }
    }
  }

  // Fetch all departments
  static async getDepartments(): Promise<{ id: number; name: string }[]> {
    const response = await api.get('/Department');
    return response.data;
  }
} 