import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

