import api from '@/lib/api/axios';
import { Comment, CreateCommentRequest, CommentResponse, CommentListResponse } from '@/lib/types';

export interface ApproveCommentRequest {
  rejectionReason?: string;
}

export class CommentService {
  // Create a new comment
  static async createComment(commentData: CreateCommentRequest): Promise<CommentResponse> {
    try {
      const response = await api.post<CommentResponse>('/comments', commentData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating comment:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid comment data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to create comments. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to create comment. Please try again.');
      }
    }
  }

  // Get all comments for a survey
  static async getCommentsBySurveyId(surveyId: number): Promise<CommentListResponse> {
    try {
      const response = await api.get<CommentListResponse>(`/comments/survey/${surveyId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view comments. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch comments. Please try again.');
      }
    }
  }

  // Get all pending comments (for moderation)
  static async getPendingComments(): Promise<CommentListResponse> {
    try {
      const response = await api.get<CommentListResponse>('/comments/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending comments:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view pending comments. Admin/Teacher access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch pending comments. Please try again.');
      }
    }
  }

  // Approve a comment
  static async approveComment(commentId: number): Promise<CommentResponse> {
    try {
      const response = await api.put<CommentResponse>(`/comments/${commentId}/approve`);
      return response.data;
    } catch (error: any) {
      console.error('Error approving comment:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to approve comments. Admin/Teacher access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to approve comment. Please try again.');
      }
    }
  }

  // Reject a comment
  static async rejectComment(commentId: number, rejectionReason?: string): Promise<CommentResponse> {
    try {
      const response = await api.put<CommentResponse>(`/comments/${commentId}/reject`, {
        rejectionReason
      });
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting comment:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to reject comments. Admin/Teacher access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to reject comment. Please try again.');
      }
    }
  }

  // Delete a comment
  static async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to delete comments. Admin/Teacher access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to delete comment. Please try again.');
      }
    }
  }

  // Get comment statistics
  static async getCommentStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const response = await api.get('/comments/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching comment statistics:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view statistics. Admin/Teacher access required.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch statistics. Please try again.');
      }
    }
  }
} 