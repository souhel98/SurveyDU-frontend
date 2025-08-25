import api from '@/lib/api/axios';
import { User, UserProfile, UpdateProfileRequest, UserResponse, UserListResponse } from '@/lib/types';

export class UserService {
  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserResponse> {
    let attempts = 0;
    const maxAttempts = 3;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    while (attempts < maxAttempts) {
      try {
        // Determine role from cookie or localStorage
        let role: string | null = null;
        if (typeof document !== 'undefined') {
          // Try cookie first
          const getCookie = (name: string): string | null => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
              const part = parts.pop();
              if (part) return part.split(';').shift() || null;
            }
            return null;
          };
          role = getCookie('role');
          if (!role) {
            // fallback to localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                role = user.userType;
              } catch {}
            }
          }
        }
        let endpoint = '/users/profile';
        if (role === 'Admin') endpoint = '/Admin/profile';
        else if (role === 'Teacher') endpoint = '/Teacher/profile';
        else if (role === 'Student') endpoint = '/Student/profile';
        const response = await api.get<UserResponse>(endpoint);
        return response.data;
      } catch (error: any) {
        attempts++;
        if (error.response?.status === 401 || error.response?.status === 404) {
          if (attempts >= maxAttempts) {
            // User deleted or unauthorized after retries
            if (typeof window !== 'undefined') {
              const { AuthService } = await import('./auth-service');
              AuthService.logout();
              window.location.href = '/auth/signin';
            }
            throw new Error('Your account is no longer available. You have been signed out.');
          } else {
            await delay(1000); // Wait 1 second before retry
            continue;
          }
        } else if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Request timeout. Please check your internet connection and try again.');
        } else if (!error.response) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else {
          throw new Error(error.response.data?.message || 'Failed to fetch profile. Please try again.');
        }
      }
    }
    // Should never reach here
    throw new Error('Failed to fetch profile after multiple attempts.');
  }

  // Update user profile
  static async updateProfile(profileData: UpdateProfileRequest): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid profile data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to update profile. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to update profile. Please try again.');
      }
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid password data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('Current password is incorrect.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to change password. Please try again.');
      }
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(): Promise<UserListResponse> {
    try {
      const response = await api.get<UserListResponse>('/users');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view users. Admin access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch users. Please try again.');
      }
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(id: string): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to view this user. Admin access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch user. Please try again.');
      }
    }
  }

  // Update user (Admin only)
  static async updateUser(id: string, userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid user data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to update users. Admin access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to update user. Please try again.');
      }
    }
  }

  // Delete user (Admin only)
  static async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to delete users. Admin access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to delete user. Please try again.');
      }
    }
  }

  // Get student points balance
  static async getStudentPointsBalance(): Promise<number> {
    try {
      const response = await api.get('/Student/points/balance');
      if (response.data && response.data.success && response.data.data && typeof response.data.data.balance === 'number') {
        return response.data.data.balance;
      } else {
        throw new Error('Invalid response format for points balance.');
      }
    } catch (error: any) {
      console.error('Error fetching student points balance:', error);
      if (error.response?.status === 401) {
        throw new Error('You are not authorized. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch points balance. Please try again.');
      }
    }
  }

  // Get student points history
  static async getStudentPointsHistory(): Promise<any> {
    try {
      const response = await api.get('/Student/points/history');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching student points history:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view points history. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch points history. Please try again.');
      }
    }
  }
} 