import axios from 'axios';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Unable to connect to server');
    } else {
      // Something else happened
      throw new Error('An error occurred');
    }
  }
);

// API methods
export const api = {
  // Authentication
  auth: {
    register: (data) => axiosInstance.post('/auth/register', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    logout: () => axiosInstance.post('/auth/logout'),
    getCurrentUser: () => axiosInstance.get('/auth/me')
  },

  // Courses
  courses: {
    getAll: () => axiosInstance.get('/courses'),
    create: (data) => axiosInstance.post('/courses', data),
    update: (id, data) => axiosInstance.put(`/courses/${id}`, data),
    delete: (id) => axiosInstance.delete(`/courses/${id}`)
  },

  // Assignments
  assignments: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters);
      return axiosInstance.get(`/assignments?${params}`);
    },
    create: (data) => axiosInstance.post('/assignments', data),
    update: (id, data) => axiosInstance.put(`/assignments/${id}`, data),
    delete: (id) => axiosInstance.delete(`/assignments/${id}`)
  },

  // Study Sessions
  studySessions: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters);
      return axiosInstance.get(`/study-sessions?${params}`);
    },
    create: (data) => axiosInstance.post('/study-sessions', data)
  },

  // Analytics
  analytics: {
    getDashboard: () => axiosInstance.get('/analytics/dashboard')
  }
};
