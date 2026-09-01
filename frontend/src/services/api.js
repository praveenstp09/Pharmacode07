import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL;

if (!rawBaseUrl) {
  // If running on localhost / 127.0.0.1, use Vite proxy /api
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    rawBaseUrl = '/api';
  } else {
    // In production on Render (e.g. pharmacode07-arxj.onrender.com), connect directly to backend
    rawBaseUrl = 'https://pharmacode07.onrender.com/api';
  }
}

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

// Response interceptor to handle global errors (with automatic refresh token rotation)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Don't loop refresh on refresh-token endpoint itself or login endpoint
      if (originalRequest.url?.includes('/auth/refresh-token') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('pharmacode_refresh_token');
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${rawBaseUrl}/auth/refresh-token`, { refreshToken });
          if (res.data.success && res.data.token) {
            const newToken = res.data.token;
            const newRefreshToken = res.data.refreshToken;
            localStorage.setItem('pharmacode_token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('pharmacode_refresh_token', newRefreshToken);
            }
            if (res.data.user) {
              localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('pharmacode_token');
          localStorage.removeItem('pharmacode_refresh_token');
          localStorage.removeItem('pharmacode_user');
          const protectedRoutes = ['/dashboard', '/admin', '/attempt', '/checkout'];
          if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
            window.location.href = '/login?session=expired';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('pharmacode_token');
        localStorage.removeItem('pharmacode_refresh_token');
        localStorage.removeItem('pharmacode_user');
        const protectedRoutes = ['/dashboard', '/admin', '/attempt', '/checkout'];
        if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
          window.location.href = '/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
