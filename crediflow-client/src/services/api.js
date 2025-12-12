import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getById: (id) => api.get(`/applications/${id}`),
  getAll: (params) => api.get('/applications', { params }),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  uploadDocument: (id, formData) => 
    api.post(`/applications/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStage: (id, stage) => api.put(`/applications/${id}/stage`, { stage }),
  approve: (id, data) => api.put(`/applications/${id}/approve`, data),
  reject: (id, reason) => api.put(`/applications/${id}/reject`, { rejectionReason: reason }),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (applicationId) => api.get(`/chat/${applicationId}/history`),
  verifyKYC: (applicationId) => api.post(`/chat/${applicationId}/verify-kyc`),
  triggerUnderwriting: (applicationId) => api.post(`/chat/${applicationId}/underwrite`),
};

export default api;
