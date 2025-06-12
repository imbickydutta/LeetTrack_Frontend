import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Configure API base URL
import axios from 'axios';

// Set API base URL based on environment
const isDevelopment = import.meta.env.DEV;
axios.defaults.baseURL = isDevelopment 
  ? 'http://localhost:3030/api'
  : 'https://leettrack-backend.onrender.com/api';

// Ensure CSS is loaded
document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/index.css';
  document.head.appendChild(link);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
