import axios from 'axios';

// Create a dedicated Axios instance
// Check if we are in production (you can also use import.meta.env.PROD)
// Check if we are in production (you can also use import.meta.env.PROD)
const isProduction = import.meta.env.MODE === 'production';

// Define the Base URL
// Priority: 1. VITE_SERVER_URL, 2. Production Fallback, 3. Localhost
let baseURL = import.meta.env.VITE_SERVER_URL;

if (!baseURL) {
    if (isProduction) {
        // Fallback for production if environment variable is missing
        baseURL = 'https://mediconnects-server.onrender.com/api/v1';
        console.warn('WARNING: VITE_SERVER_URL is not defined. Using fallback production URL:', baseURL);
    } else {
        baseURL = 'http://localhost:8082/api/v1';
    }
}

// Ensure local development always uses local backend even if some prod env var is leaking
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseURL = 'http://localhost:8082/api/v1';
}

// baseURL is set above based on environment

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// Add response interceptor for better error handling (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
