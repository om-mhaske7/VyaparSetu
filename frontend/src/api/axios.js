import axios from "axios";

// Create an Axios instance with a base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", // Use environment variable for production
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
  withCredentials: false, // Set to true if you need cookies
});

// Automatically include token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 0) {
      console.error('Network error - check if backend is running');
    }
    return Promise.reject(error);
  }
);

export default API;
