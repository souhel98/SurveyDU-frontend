import api from '@/lib/api/axios'

export interface QuestionType {
  typeId: number
  typeName: string
  description: string
}

export class QuestionTypeService {
  static async getQuestionTypes(): Promise<QuestionType[]> {
    try {
      const response = await api.get('/Teacher/question-types')
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch question types')
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Unauthorized access to question types')
          case 403:
            throw new Error('Forbidden: You do not have permission to access question types')
          case 404:
            throw new Error('Question types endpoint not found')
          case 500:
            throw new Error('Server error while fetching question types')
          default:
            throw new Error(`Failed to fetch question types: ${error.response.data?.message || error.message}`)
        }
      } else if (error.request) {
        throw new Error('Network error: Unable to connect to the server')
      } else {
        throw new Error(`Error fetching question types: ${error.message}`)
      }
    }
  }
} 