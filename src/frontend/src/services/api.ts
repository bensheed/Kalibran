import axios from 'axios';

console.log('[API] Loading api.ts file...');

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

// Create axios instance with correct baseURL
const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

console.log('[API] Axios instance created');

// Add request interceptor for adding auth token
api.interceptors.request.use(
    config => {
        config.baseURL = 'http://localhost:3001';
        
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

// API functions - Use function declaration for better hoisting and bundling compatibility
export async function loginUser(pin: string) {
    console.log('[API] loginUser called with pin:', pin);
    const response = await api.post('/api/login', { pin });
    return response.data;
}

export const createBoard = async (name: string) => {
    const response = await api.post('/api/boards', { name });
    return response.data;
};

export default api;
