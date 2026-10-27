import axios from 'axios';

// Temporary console log to inspect environment variable in browser developer tools
console.log('[StayMate API] import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Base API configuration dynamically resolving baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Guard against trailing slash on baseURL to prevent double slashes (e.g., baseURL ending in '/api/' + route '/auth/login')
if (api.defaults.baseURL && typeof api.defaults.baseURL === 'string') {
  api.defaults.baseURL = api.defaults.baseURL.replace(/\/+$/, '');
}

console.log('[StayMate API] Resolved baseURL:', api.defaults.baseURL);

// Request Interceptor: Attach Authorization Bearer token if available
api.interceptors.request.use(
  (config) => {
    // Guard against leading double slashes in relative routes
    if (config.url && config.url.startsWith('//')) {
      config.url = config.url.replace(/^\/+/, '/');
    }
    const token = localStorage.getItem('staymate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing request target URL for transparent devtools auditing
    const fullURL = config.url.startsWith('http')
      ? config.url
      : `${(config.baseURL || '').replace(/\/+$/, '')}/${config.url.replace(/^\/+/, '')}`;
    console.log(`[StayMate API Request] ${config.method?.toUpperCase()} -> ${fullURL}`);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling and auto-logout on 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('staymate_token');
      localStorage.removeItem('staymate_user');

      // Only redirect if not already on the login or register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
