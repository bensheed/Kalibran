import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// DIRECT FIX: Create axios instance with correct baseURL
const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

// FORCE OVERRIDE: Ensure baseURL stays correct
api.defaults.baseURL = 'http://localhost:3001';

// Add request interceptor for adding auth token
api.interceptors.request.use(
    config => {
        // FORCE CORRECT BASEURL ON EVERY REQUEST
        config.baseURL = 'http://localhost:3001';
        
        // Get token from auth store first (most reliable)
        const { token } = useAuthStore.getState();
        
        // If not in store, try to get from cookie as fallback
        let authToken = token;
        if (!authToken) {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'session_id') {
                    authToken = value;
                    break;
                }
            }
        }

        // Add token to headers if it exists
        if (authToken && config.headers) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
