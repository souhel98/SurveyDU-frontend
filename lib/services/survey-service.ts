import api from '@/lib/api/axios';
import axios from 'axios';
import { Survey, Question, SurveyResponse, SurveyListResponse } from '@/lib/types';

export class SurveyService {
  // Create a new survey
  // static async createSurvey(surveyData: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurveyResponse> {
  //   try {
  //     const response = await api.post<SurveyResponse>('/surveys', surveyData);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error creating survey:', error);
      
  //     if (error.response?.status === 400) {
  //       throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to create surveys. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to create survey. Please try again.');
  //     }
  //   }
  // }

  // // Get all surveys
  // static async getSurveys(): Promise<SurveyListResponse> {
  //   try {
  //     const response = await api.get<SurveyListResponse>('/surveys');
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error fetching surveys:', error);
      
  //     if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to view surveys. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to fetch surveys. Please try again.');
  //     }
  //   }
  // }

  // // Get survey by ID
  // static async getSurveyById(id: number): Promise<SurveyResponse> {
  //   try {
  //     const response = await api.get<SurveyResponse>(`/surveys/${id}`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error fetching survey:', error);
      
  //     if (error.response?.status === 404) {
  //       throw new Error('Survey not found.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to view this survey. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to fetch survey. Please try again.');
  //     }
  //   }
  // }

  // // Update survey
  // static async updateSurvey(id: number, surveyData: Partial<Survey>): Promise<SurveyResponse> {
  //   try {
  //     const response = await api.put<SurveyResponse>(`/surveys/${id}`, surveyData);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error updating survey:', error);
      
  //     if (error.response?.status === 404) {
  //       throw new Error('Survey not found.');
  //     } else if (error.response?.status === 400) {
  //       throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to update this survey. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to update survey. Please try again.');
  //     }
  //   }
  // }

  // Delete survey
  // static async deleteSurvey(id: number): Promise<{ success: boolean; message: string }> {
  //   try {
  //     const response = await api.delete(`/surveys/${id}`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error deleting survey:', error);
      
  //     if (error.response?.status === 404) {
  //       throw new Error('Survey not found.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to delete this survey. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to delete survey. Please try again.');
  //     }
  //   }
  // }

  // Submit survey response
  // static async submitSurveyResponse(surveyId: number, responses: any): Promise<{ success: boolean; message: string }> {
  //   try {
  //     const response = await api.post(`/surveys/${surveyId}/responses`, responses);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error submitting survey response:', error);
      
  //     if (error.response?.status === 400) {
  //       throw new Error(error.response.data?.message || 'Invalid response data. Please check your input.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to submit responses. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to submit response. Please try again.');
  //     }
  //   }
  // }

  // Get survey analytics
  // static async getSurveyAnalytics(surveyId: number): Promise<any> {
  //   try {
  //     const response = await api.get(`/surveys/${surveyId}/analytics`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error fetching survey analytics:', error);
      
  //     if (error.response?.status === 404) {
  //       throw new Error('Survey not found.');
  //     } else if (error.response?.status === 401) {
  //       throw new Error('You are not authorized to view analytics. Please log in.');
  //     } else if (error.response?.status >= 500) {
  //       throw new Error('Server error. Please try again later.');
  //     } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
  //       throw new Error('Request timeout. Please check your internet connection and try again.');
  //     } else if (!error.response) {
  //       throw new Error('Network error. Please check your internet connection and try again.');
  //     } else {
  //       throw new Error(error.response.data?.message || 'Failed to fetch analytics. Please try again.');
  //     }
  //   }
  //   }

  //Admin:

  // Fetch all surveys
  static async getAllSurveys(): Promise<any[]> {
    try {
      const response = await api.get('/Admin/surveys');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch all surveys.');
      }
    } catch (error: any) {
      console.error('Error fetching all surveys:', error);
      throw new Error(error.message || 'Failed to fetch all surveys.');
    }
  }

  // Fetch all admin surveys
  static async getAdminSurveys(): Promise<any[]> {
    try {
      const response = await api.get('/Admin/my-surveys');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch admin surveys.');
      }
    } catch (error: any) {
      console.error('Error fetching admin surveys:', error);
      throw new Error(error.message || 'Failed to fetch admin surveys.');
    }
  }

  // Get admin survey by ID
  static async getAdminSurveyById(id: number): Promise<any> {
    try {
      console.log('Fetching admin survey with ID:', id);
      const response = await api.get(`/Admin/surveys/${id}`);
      console.log('API response for getAdminSurveyById:', response);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch admin survey.');
      }
    } catch (error: any) {
      console.error('Error fetching admin survey:', error);
      
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

  // Admin: Create survey with questions
  static async adminCreateSurveyWithQuestions(surveyData: any): Promise<any> {
    try {
      const response = await api.post('/Admin/surveys/with-questions', surveyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating admin survey with questions:', error);
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

  // Duplicate admin survey
  static async duplicateAdminSurvey(id: number): Promise<any> {
    try {
      // First, get the original survey data
      const originalSurvey = await this.getAdminSurveyById(id);
      
      // Map question types to typeId
      const getTypeId = (questionType: string): number => {
        switch (questionType) {
          case 'multiple_choice': return 1;
          case 'single_answer': return 2;
          case 'open_text': return 3;
          case 'percentage': return 4;
          default: return 1;
        }
      };

      // Prepare the duplicate data according to the API structure
      const duplicateData = {
        title: `${originalSurvey.title} (Copy)`,
        description: originalSurvey.description,
        targetAcademicYears: originalSurvey.targetAcademicYears,
        targetDepartmentIds: originalSurvey.targetDepartmentIds,
        targetGender: originalSurvey.targetGender,
        requiredParticipants: originalSurvey.requiredParticipants,
        pointsReward: originalSurvey.pointsReward,
        startDate: originalSurvey.startDate,
        endDate: originalSurvey.endDate,
        publishImmediately: false, // Always create as draft
        questions: originalSurvey.questions.map((question: any) => ({
          questionText: question.questionText,
          typeId: getTypeId(question.questionType),
          options: question.options || [],
          required: question.required || false,
          order: question.order || 0
        }))
      };

      // Create the duplicate survey
      const response = await api.post('/Admin/surveys/with-questions', duplicateData);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to duplicate survey.');
      }
    } catch (error: any) {
      console.error('Error duplicating admin survey:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to duplicate surveys. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to duplicate survey. Please try again.');
      }
    }
  }

  // Admin: Delete survey
  static async deleteAdminSurvey(id: number): Promise<any> {
    try {
      const response = await api.delete(`/Admin/surveys/${id}`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to delete survey.');
      }
    } catch (error: any) {
      console.error('Error deleting admin survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid request. Please check your input.');
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


   // Publish admin survey (change from draft to active)
  static async publishAdminSurvey(id: number): Promise<any> {
    try {
      const response = await api.post(`/Admin/my-surveys/${id}/publish`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to publish survey.');
      }
    } catch (error: any) {
      console.error('Error publishing admin survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Survey cannot be published. Please check the survey details.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to publish this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to publish survey. Please try again.');
      }
    }
  }

  // Unpublish admin survey (change from active to draft)
  static async unpublishAdminSurvey(id: number): Promise<any> {
    try {
      const response = await api.post(`/Admin/my-surveys/${id}/unpublish`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to unpublish survey.');
      }
    } catch (error: any) {
      console.error('Error unpublishing admin survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Survey cannot be unpublished. Please check the survey details.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to unpublish this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to unpublish survey. Please try again.');
      }
    }
  }

  // Admin: Get survey statistics
  static async getAdminSurveyStatistics(surveyId: string): Promise<any> {
    try {
      const response = await api.get(`/Admin/surveys/${surveyId}/statistics`);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch survey statistics.');
      }
    } catch (error: any) {
      console.error('Error fetching survey statistics:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to view statistics. Please log in.');
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

  // Admin: Update survey dates and participants
  static async updateAdminSurveyDates(surveyId: number, updateData: {
    startDate?: string;
    endDate?: string;
    requiredParticipants?: number;
  }): Promise<any> {
    try {
      const response = await api.put(`/Admin/surveys/${surveyId}/dates`, updateData);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update survey dates.');
      }
    } catch (error: any) {
      console.error('Error updating admin survey dates:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to update this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to update survey dates. Please try again.');
      }
    }
  }

  // Admin: Update survey with questions
  static async updateAdminSurveyWithQuestions(surveyId: number, surveyData: any): Promise<any> {
    try {
      const response = await api.put(`/Admin/my-surveys/${surveyId}/with-questions`, surveyData);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update survey.');
      }
    } catch (error: any) {
      console.error('Error updating admin survey with questions:', error);
      
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


  //--------------------------------------------------------------------------//

  //Teacher:

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

  // Get teacher survey by ID
  static async getTeacherSurveyById(id: number): Promise<any> {
    try {
      console.log('Fetching teacher survey with ID:', id);
      const response = await api.get(`/Teacher/surveys/${id}`);
      console.log('API response for getTeacherSurveyById:', response);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch teacher survey.');
      }
    } catch (error: any) {
      console.error('Error fetching teacher survey:', error);
      
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

  // Teacher: Create survey with questions
  static async teacherCreateSurveyWithQuestions(surveyData: any): Promise<any> {
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

  // Duplicate teacher survey
  static async duplicateTeacherSurvey(id: number): Promise<any> {
    try {
      // First, get the original survey data
      const originalSurvey = await this.getTeacherSurveyById(id);
      
      // Map question types to typeId
      const getTypeId = (questionType: string): number => {
        switch (questionType) {
          case 'multiple_choice': return 1;
          case 'single_answer': return 2;
          case 'open_text': return 3;
          case 'percentage': return 4;
          default: return 1;
        }
      };

      // Prepare the duplicate data according to the API structure
      const duplicateData = {
        title: `${originalSurvey.title} (Copy)`,
        description: originalSurvey.description,
        targetAcademicYears: originalSurvey.targetAcademicYears,
        targetDepartmentIds: originalSurvey.targetDepartmentIds,
        targetGender: originalSurvey.targetGender,
        requiredParticipants: originalSurvey.requiredParticipants,
        pointsReward: originalSurvey.pointsReward,
        startDate: originalSurvey.startDate,
        endDate: originalSurvey.endDate,
        publishImmediately: false, // Always create as draft
        questions: originalSurvey.questions.map((question: any) => ({
          questionText: question.questionText,
          typeId: getTypeId(question.questionType),
          isRequired: question.isRequired,
          questionOrder: question.questionOrder,
          options: question.options?.map((option: any) => ({
            optionText: option.optionText,
            optionOrder: option.optionOrder
          })) || []
        }))
      };

      // Create the duplicate survey
      const response = await api.post('/Teacher/surveys/with-questions', duplicateData);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to duplicate survey.');
      }
    } catch (error: any) {
      console.error('Error duplicating teacher survey:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid survey data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to duplicate surveys. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to duplicate survey. Please try again.');
      }
    }
  }

  // Publish teacher survey (change from draft to active)
  static async publishTeacherSurvey(id: number): Promise<any> {
    try {
      const response = await api.post(`/Teacher/surveys/${id}/publish`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to publish survey.');
      }
    } catch (error: any) {
      console.error('Error publishing teacher survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Survey cannot be published. Please check the survey details.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to publish this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to publish survey. Please try again.');
      }
    }
  }

  // Unpublish teacher survey (change from active to draft)
  static async unpublishTeacherSurvey(id: number): Promise<any> {
    try {
      const response = await api.post(`/Teacher/surveys/${id}/unpublish`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to unpublish survey.');
      }
    } catch (error: any) {
      console.error('Error unpublishing teacher survey:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Survey cannot be unpublished. Please check the survey details.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to unpublish this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to unpublish survey. Please try again.');
      }
    }
  }

  // Teacher: Get survey statistics
  static async getTeacherSurveyStatistics(surveyId: string): Promise<any> {
    try {
      const response = await api.get(`/Teacher/surveys/${surveyId}/statistics`);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch survey statistics.');
      }
    } catch (error: any) {
      console.error('Error fetching survey statistics:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to view statistics. Please log in.');
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

  // Teacher: Update survey dates and participants
  static async updateTeacherSurveyDates(surveyId: number, updateData: {
    startDate?: string;
    endDate?: string;
    requiredParticipants?: number;
  }): Promise<any> {
    try {
      const response = await api.put(`/Teacher/surveys/${surveyId}/dates`, updateData);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update survey dates.');
      }
    } catch (error: any) {
      console.error('Error updating teacher survey dates:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Survey not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to update this survey. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to update survey dates. Please try again.');
      }
    }
  }

  // Teacher: Update survey with questions
  static async updateTeacherSurveyWithQuestions(surveyId: number, surveyData: any): Promise<any> {
    try {
      const response = await api.put(`/Teacher/surveys/${surveyId}/with-questions`, surveyData);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update survey.');
      }
    } catch (error: any) {
      console.error('Error updating teacher survey with questions:', error);
      
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


  //----------------------------------------------------------------------------//

  //Student:

  // Student: Get survey by ID for participation
  static async getStudentSurveyById(id: number): Promise<any> {
    try {
      const response = await api.get(`/Student/surveys/${id}`);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        // Handle the specific "Survey not found or not available" case
        if (response.data?.message === "Survey not found or not available") {
          throw new Error("Survey not found or not available");
        }
        throw new Error(response.data?.message || 'Failed to fetch survey.');
      }
    } catch (error: any) {
      console.error('Error fetching student survey:', error);
      
      // Handle the specific "Survey not found or not available" case from response
      if (error.response?.data?.message === "Survey not found or not available") {
        throw new Error("Survey not found or not available");
      }
      
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

  // Student: Submit survey answers
  static async submitStudentSurveyAnswers(surveyId: number, answers: any): Promise<any> {
    try {
      const response = await api.post(`/Student/surveys/${surveyId}/submit`, answers);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to submit survey answers.');
      }
    } catch (error: any) {
      console.error('Error submitting student survey answers:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid answer data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to submit answers. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to submit answers. Please try again.');
      }
    }
  }

  // Student: Get participation history
  static async getStudentParticipationHistory(): Promise<any> {
    try {
      const response = await api.get('/Student/participation-history');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching student participation history:', error);
      
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view participation history. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch participation history. Please try again.');
      }
    }
  }

  //---------------------------------------------------------------------------------------//

  
  // Generate questions with AI
  static async generateQuestionsWithAI(requestData: {
    surveyTitle: string;
    surveyDescription: string;
    questionTypes: Array<{ typeId: number; count: number }>;
    additionalDetails?: string;
    defaultOptions?: number;
  }): Promise<any> {
    try {
      // Create a custom axios instance with extended timeout for AI generation
      const aiApi = axios.create({
        baseURL: 'https://mhhmd6g0-001-site1.rtempurl.com/api',
        timeout: 180000, // 3 minutes for AI generation 
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add token to request
      const token = localStorage.getItem('token');
      if (token) {
        aiApi.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await aiApi.post('/Teacher/generate-questions', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error generating questions with AI:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid request data. Please check your input.');
      } else if (error.response?.status === 401) {
        throw new Error('You are not authorized to generate questions. Please log in.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('AI generation is taking longer than expected. Please wait and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to generate questions. Please try again.');
      }
    }
  }
} 