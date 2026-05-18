import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'https://taskflow-production-22fe.up.railway.app/api';
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL += '/api';
}

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
