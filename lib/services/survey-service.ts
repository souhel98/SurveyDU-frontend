import api from '@/lib/api/axios';
import { Survey, Question, SurveyResponse, SurveyListResponse } from '@/lib/types';

export class SurveyService {
  // Create a new survey
  static async createSurvey(surveyData: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurveyResponse> {
    try {
      const response = await api.post<SurveyResponse>('/surveys', surveyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating survey:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to create surveys. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to create survey. Please try again.');
      }
    }
  }

  // Teacher: Create survey with questions
  static async createSurveyWithQuestions(surveyData: any): Promise<any> {
    try {
      const response = await api.post('/Teacher/surveys/with-questions', surveyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating teacher survey with questions:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to create surveys. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to create survey. Please try again.');
      }
    }
  }

  // Get all surveys
  static async getSurveys(): Promise<SurveyListResponse> {
    try {
      const response = await api.get<SurveyListResponse>('/surveys');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching surveys:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view surveys. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch surveys. Please try again.');
      }
    }
  }

  // Get survey by ID
  static async getSurveyById(id: number): Promise<SurveyResponse> {
    try {
      const response = await api.get<SurveyResponse>(`/surveys/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to view this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch survey. Please try again.');
      }
    }
  }

  // Update survey
  static async updateSurvey(id: number, surveyData: Partial<Survey>): Promise<SurveyResponse> {
    try {
      const response = await api.put<SurveyResponse>(`/surveys/${id}`, surveyData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to update this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to update survey. Please try again.');
      }
    }
  }

  // Delete survey
  static async deleteSurvey(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/surveys/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to delete this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to delete survey. Please try again.');
      }
    }
  }

  // Submit survey response
  static async submitSurveyResponse(surveyId: number, responses: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/surveys/${surveyId}/responses`, responses);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting survey response:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid response data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to submit responses. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to submit response. Please try again.');
      }
    }
  }

  // Get survey analytics
  static async getSurveyAnalytics(surveyId: number): Promise<any> {
    try {
      const response = await api.get(`/surveys/${surveyId}/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching survey analytics:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to view analytics. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch analytics. Please try again.');
      }
    }
    }

  // Fetch all teacher surveys
  static async getTeacherSurveys(): Promise<any[]> {
    try {
      const response = await api.get('/Teacher/surveys');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch teacher surveys.');
      }
    } catch (error: any) {
      console.error('Error fetching teacher surveys:', error);
      throw new Error(error.message || 'Failed to fetch teacher surveys.');
    }
  }
} 