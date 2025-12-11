import axios from 'axios';

// Use shared API URL utility
import { getApiBaseUrl } from '../utils/apiConfig';
const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const subjectsAPI = {
  // Get all subjects
  getAll: (params) => api.get('/subject', { params }),
  
  // Get single subject
  getById: (id) => api.get(`/subject/${id}`),
  
  // Create subject (admin)
  create: (data) => api.post('/subject', data),
  
  // Update subject (admin)
  update: (id, data) => api.put(`/subject/${id}`, data),
  
  // Delete subject (admin)
  delete: (id) => api.delete(`/subject/${id}`),
};

export default subjectsAPI;

