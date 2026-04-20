import axios, { AxiosInstance } from 'axios';
import { Form, Feedback, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (email: string, password: string, name: string, role: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },
  validateToken: async () => {
    const { data } = await api.get('/auth/validate');
    return data;
  },
};

// Forms API
export const formsAPI = {
  getAllForms: async () => {
    const { data } = await api.get('/forms');
    return data;
  },
  createForm: async (form: { title: string; description: string; questions?: any[] }) => {
    const { data } = await api.post('/forms', form);
    return data;
  },
  getFormById: async (id: string) => {
    const { data } = await api.get(`/forms/${id}`);
    return data;
  },
  updateForm: async (id: string, form: any) => {
    const { data } = await api.put(`/forms/${id}`, form);
    return data;
  },
  deleteForm: async (id: string) => {
    const { data } = await api.delete(`/forms/${id}`);
    return data;
  },
  publishForm: async (id: string) => {
    const { data } = await api.post(`/forms/${id}/publish`);
    return data;
  },
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: async (formId: string, answers: any[]) => {
    const { data } = await api.post('/feedback', { formId, answers });
    return data;
  },
  getFeedbackByFormId: async (formId: string, page = 1, limit = 10, search?: string) => {
    const { data } = await api.get(`/feedback/form/${formId}`, {
      params: { page, limit, search },
    });
    return data;
  },
  deleteFeedback: async (feedbackId: string) => {
    const { data } = await api.delete(`/feedback/${feedbackId}`);
    return data;
  },
};

// Analytics API
export const analyticsAPI = {
  getFormAnalytics: async (formId: string) => {
    const { data } = await api.get(`/analytics/${formId}`);
    return data;
  },
  getDashboard: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },
};

export default api;
