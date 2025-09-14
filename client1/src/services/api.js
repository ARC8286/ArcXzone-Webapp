// src/services/api.js
import axios from 'axios';

// src/services/api.js में change करें:
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const contentAPI = {
  // Get all content with filters
  getAll: (params) => api.get('/content', { params }),
  
  // Get content by ID
  getById: (id) => api.get(`/content/${id}`),
  
  // Search content
  search: (query, type) => api.get('/content/search', { 
    params: { 
      q: query, 
      ...(type && type !== 'all' && { type }) 
    } 
  }),
  
  // Create new content
  create: (data) => api.post('/content', data),
  
  // Update content
  update: (id, data) => api.put(`/content/${id}`, data),
  
  // Delete content
  delete: (id) => api.delete(`/content/${id}`),
  
  // Get content by type
  getByType: (type, params) => api.get(`/content/type/${type}`, { params }),
};

export const availabilityAPI = {
  // Get all availabilities for a content
  getByContentId: (contentId) => api.get(`/content/${contentId}/availability`),
  
  // Create new availability
  create: (contentId, data) => api.post(`/content/${contentId}/availability`, data),
  
  // Update availability
  update: (contentId, availabilityId, data) =>
    api.put(`/content/${contentId}/availability/${availabilityId}`, data),
  
  // Delete availability
  delete: (contentId, availabilityId) =>
    api.delete(`/content/${contentId}/availability/${availabilityId}`),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const userAPI = {
  getWatchlist: () => api.get('/users/watchlist'),
  addToWatchlist: (contentId) => api.post('/users/watchlist', { contentId }),
  removeFromWatchlist: (contentId) => api.delete(`/users/watchlist/${contentId}`),
  getWatched: () => api.get('/users/watched'),
  addToWatched: (contentId) => api.post('/users/watched', { contentId }),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
};



export default api;