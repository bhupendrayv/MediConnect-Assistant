import axios from 'axios';

// Create a dedicated Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8080/api/v1',
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
