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

export const questionPapersAPI = {
  // Get all question papers
  getAll: (params) => api.get('/question-papers', { params }),
  
  // Get single question paper
  getById: (id) => api.get(`/question-papers/${id}`),
  
  // Create question paper (admin)
  create: (data) => api.post('/question-papers', data),
  
  // Update question paper (admin)
  update: (id, data) => api.put(`/question-papers/${id}`, data),
  
  // Delete question paper (admin)
  delete: (id) => api.delete(`/question-papers/${id}`),
};

export default questionPapersAPI;

