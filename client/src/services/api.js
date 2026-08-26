import axios from 'axios';

// Create a dedicated Axios instance
// Check if we are in production (you can also use import.meta.env.PROD)
// Check if we are in production (you can also use import.meta.env.PROD)
const isProduction = import.meta.env.MODE === 'production';

let baseURL = import.meta.env.VITE_SERVER_URL || '/api/v1';

// If running in development and no server URL is provided, use the local proxy
if (import.meta.env.DEV && !import.meta.env.VITE_SERVER_URL) {
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
