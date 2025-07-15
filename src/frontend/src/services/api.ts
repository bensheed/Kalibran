import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Use the correct API URL with the /api prefix
const API_URL = 'http://localhost:53544';

console.log('API URL configured as:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add request interceptor for adding auth token and debugging
api.interceptors.request.use(
    config => {
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
            console.log('Added auth token to request:', authToken);
        } else {
            console.warn('No auth token found in store or cookies');
        }

        console.log('API Request:', {
            url: config.url || '',
            method: config.method || '',
            baseURL: config.baseURL || '',
            fullURL: (config.baseURL || '') + (config.url || ''),
            data: config.data,
            headers: config.headers
        });
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

export default api;
