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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 