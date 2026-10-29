import axios from 'axios';
import { API_URL } from '@/config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutes default timeout for large uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add a request interceptor to inject the token
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

export default api;
