import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '/api';

// Normalize URL to always end in /api
if (rawBaseUrl.startsWith('http')) {
  rawBaseUrl = rawBaseUrl.replace(/\/+$/, ''); // trim trailing slashes
  if (!rawBaseUrl.endsWith('/api')) {
    rawBaseUrl = `${rawBaseUrl}/api`;
  }
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('pharmacode_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle global errors (e.g. 401 unauthorized)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pharmacode_token');
      localStorage.removeItem('pharmacode_user');
      const protectedRoutes = ['/dashboard', '/admin', '/attempt', '/checkout'];
      if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
