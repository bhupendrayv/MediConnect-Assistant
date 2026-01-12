import axios from 'axios';

// Create a dedicated Axios instance
// Check if we are in production (you can also use import.meta.env.PROD)
// Check if we are in production (you can also use import.meta.env.PROD)
const isProduction = import.meta.env.MODE === 'production';

// Define the Base URL
// Priority: 1. VITE_SERVER_URL, 2. Localhost (dev only)
let baseURL = import.meta.env.VITE_SERVER_URL;

if (!baseURL) {
    if (isProduction) {
        console.error('CRITICAL ERROR: VITE_SERVER_URL is not defined! API calls will fail. Please set this environment variable in your deployment settings.');
        // Defaulting to empty string will cause axios to use current origin, which is useful if backend serves frontend, 
        // but fatal otherwise. We'll leave it undefined/empty to fail loudly or default to relative.
    } else {
        baseURL = 'http://localhost:8080/api/v1';
    }
}

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
