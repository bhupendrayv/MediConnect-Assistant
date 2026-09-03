import axios from 'axios';

// Create a dedicated Axios instance
// Check if we are in production (you can also use import.meta.env.PROD)
// Check if we are in production (you can also use import.meta.env.PROD)
let rawBaseURL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:8082/api/v1' : '/api/v1');
// Ensure no trailing slash
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

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
