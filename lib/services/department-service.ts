import api from "../api/axios";

export const DepartmentService = {
  async getDepartments() {
    const response = await api.get("/Department");
    return response.data;
  },
}; 