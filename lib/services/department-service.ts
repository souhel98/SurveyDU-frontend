import api from "../api/axios";

export const DepartmentService = {
  async getDepartments() {
    try {
      const response = await api.get("/Department");
      // Handle different response formats
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },
}; 