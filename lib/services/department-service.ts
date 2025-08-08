import api from "../api/axios";

export interface Department {
  id: number;
  name: string;
}

export interface CreateDepartmentRequest {
  name: string;
}

export interface UpdateDepartmentRequest {
  name: string;
}

export const DepartmentService = {
  // Get all departments
  async getDepartments(): Promise<Department[]> {
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
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  // Create a new department
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    try {
      const response = await api.post("/Department", data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to create department');
    }
  },

  // Update a department
  async updateDepartment(id: number, data: UpdateDepartmentRequest): Promise<Department> {
    try {
      const response = await api.put(`/Department/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to update department');
    }
  },

  // Delete a department
  async deleteDepartment(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/Department/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting department:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete department');
    }
  },
}; 