import axios from 'axios';

// Use the same logic as the main api.js to determine the base URL
const getApiBaseUrl = () => {
  // Check if we're in production (deployed)
  if (import.meta.env.PROD) {
    // In production, use the environment variable or default to production backend
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://backend.examfit.in/api';
  }
  // In development, use environment variable or default to localhost
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};

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

