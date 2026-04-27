import axios from 'axios';

const isDev = import.meta.env.DEV;
const rawUrl = import.meta.env.VITE_API_URL || 'https://dhsud-hredrd-monitoring-system.onrender.com';
const cleanBaseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
export const API_BASE_URL = isDev ? 'http://localhost:8000' : cleanBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true,
});

export default api;
