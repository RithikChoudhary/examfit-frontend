import axios from 'axios';
import { logApiError } from '../utils/errorLogger';

// Use shared API URL utility
import { getApiBaseUrl } from '../utils/apiConfig';

// Get API base URL - this is called at module load time (runtime in browser)
// The function checks hostname dynamically, so it will work correctly
const API_BASE_URL = getApiBaseUrl();

// Debug: Log the detected API URL (only once, at module load)
if (typeof window !== 'undefined') {
  console.log('[API Config] Detected hostname:', window.location.hostname);
  console.log('[API Config] Using API Base URL:', API_BASE_URL);
}

// Log API base URL on initialization (only in development)
if (!import.meta.env.PROD && typeof window !== 'undefined') {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] Hostname:', window.location.hostname);
  console.log('[API] Environment:', import.meta.env.PROD ? 'production' : 'development');
  console.log('[API] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'not set');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - log outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request in development
  if (!import.meta.env.PROD) {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
  }
  
  return config;
}, (error) => {
  logApiError(error, { type: 'request_error' });
  return Promise.reject(error);
});

// Response interceptor - log all errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (!import.meta.env.PROD) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log all API errors with detailed information
    logApiError(error, {
      type: 'response_error',
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      console.error('[API] Resource not found:', error.config?.url);
    }

    // Handle 500 - Server Error
    if (error.response?.status >= 500) {
      console.error('[API] Server error:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const boardsAPI = {
  getAll: (params) => api.get('/boards', { params }),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.patch(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

export const examsAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.patch(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.patch(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.patch(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  bulkUpload: (data) => api.post('/questions/bulk', data),
};

export const studentAPI = {
  getBoards: () => api.get('/student/boards'),
  createTest: (data) => api.post('/student/tests', data),
  saveAnswer: (testId, data) => api.post(`/student/tests/${testId}/answer`, data),
  submitTest: (testId) => api.post(`/student/tests/${testId}/submit`),
  getTestResult: (testId) => api.get(`/student/tests/${testId}/result`),
  deleteTest: (testId) => api.delete(`/student/tests/${testId}`),
};

export const currentAffairsAPI = {
  getAll: (params) => api.get('/current-affairs', { params }),
  getAllWithAutoFetch: (date) => api.get('/current-affairs', { params: { date, autoFetch: 'true' } }),
  getDates: () => api.get('/current-affairs/dates'),
  scrapeToday: () => api.post('/current-affairs/scrape/today'),
  scrapeForDate: (date, force = false) => api.post(`/current-affairs/scrape/${date}${force ? '?force=true' : ''}`),
};

export default api;

