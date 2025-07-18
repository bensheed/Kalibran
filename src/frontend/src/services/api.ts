import axios from 'axios';

// Helper functions to get token without circular import
const getTokenFromCookie = (): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return value;
        }
    }
    return null;
};

const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('token');
};

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
        
        console.log('[API] Request interceptor - URL:', config.url);
        console.log('[API] Request interceptor - baseURL:', config.baseURL);
        console.log('[API] Request interceptor - full URL will be:', config.baseURL + config.url);
        
        // Get token from storage first, then cookie as fallback
        let authToken = getTokenFromStorage();
        if (!authToken) {
            authToken = getTokenFromCookie();
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

// API functions
export const loginUser = async (pin: string) => {
    const response = await api.post('/api/login', { pin });
    return response.data;
};

export const createBoard = async (name: string) => {
    const response = await api.post('/api/boards', { name });
    return response.data;
};

export default api;
