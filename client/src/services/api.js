import axios from 'axios';

// Create a dedicated Axios instance
// Check if we are in production (you can also use import.meta.env.PROD)
const isProduction = import.meta.env.MODE === 'production';

// Define the Base URL
// Priority: 1. VITE_SERVER_URL, 2. Production Hardcoded URL (Fallback), 3. Localhost
const baseURL = import.meta.env.VITE_SERVER_URL || (isProduction ? 'https://mediconnects.onrender.com/api/v1' : 'http://localhost:8080/api/v1');

console.log('API Base URL:', baseURL);

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
