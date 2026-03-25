import axios from 'axios';

const api = axios.create({
  baseURL: 'https://skillfinix-aygxa7f5c5ggemds.centralindia-01.azurewebsites.net/api',
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
