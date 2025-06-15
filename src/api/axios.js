import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://leettrack-backend.onrender.com/api'
    : 'http://localhost:3030/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public routes that don't need authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/users/leaderboard'
];

api.interceptors.request.use(
  (config) => {
    // Only add token for non-public routes
    if (!publicRoutes.some(route => config.url.includes(route))) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for non-public routes
    if (error.response?.status === 401 && !publicRoutes.some(route => error.config.url.includes(route))) {
      localStorage.removeItem('token');
      // Don't redirect automatically, let the components handle it
      console.error('Authentication error:', error.response?.data?.message || 'Session expired');
    }
    return Promise.reject(error);
  }
);

export default api; 