import axios from 'axios';

// Create axios instance with base URL for API calls
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // Important for cookies
});

export default api;