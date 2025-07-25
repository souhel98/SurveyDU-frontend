import axios from "../api/axios";

const API_BASE = "/Admin";

export const AdminService = {
  async getDashboard() {
    const response = await axios.get(`${API_BASE}/dashboard`);
    return response.data;
  },
  async getUsers() {
    const response = await axios.get(`${API_BASE}/users`);
    return response.data;
  },
  async getUserById(id: string) {
    const response = await axios.get(`${API_BASE}/users/${id}`);
    return response.data;
  },
  async updateUser(id: string, data: any) {
    const response = await axios.put(`${API_BASE}/users/${id}`, data);
    return response.data;
  },
  async deleteUser(id: string) {
    const response = await axios.delete(`${API_BASE}/users/${id}`);
    return response.data;
  },
  async registerTeacher(data: { firstName: string; lastName: string; email: string; departmentId: number }) {
    const response = await axios.post(`${API_BASE}/register/teacher`, data);
    return response.data;
  },
  async registerAdmin(data: { firstName: string; lastName: string; email: string }) {
    const response = await axios.post(`${API_BASE}/register-admin`, data);
    return response.data;
  },
  async getProfile() {
    const response = await axios.get(`${API_BASE}/profile`);
    return response.data;
  },
}; 