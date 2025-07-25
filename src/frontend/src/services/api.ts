import axios from 'axios';

console.log('[API] ===== LOADING API.TS FILE =====');
console.log('[API] File loaded at:', new Date().toISOString());
console.log('[API] axios imported:', typeof axios);

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

console.log('[API] Creating axios instance...');

// DIRECT FIX: Create axios instance with correct baseURL
const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

// FORCE OVERRIDE: Ensure baseURL stays correct
api.defaults.baseURL = 'http://localhost:3001';

console.log('[API] Axios instance created successfully');
console.log('[API] api instance type:', typeof api);
console.log('[API] api.post type:', typeof api.post);

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

console.log('[API] ===== DEFINING LOGINUSER FUNCTION =====');

// API functions - Define as function declaration first, then export
async function loginUserImpl(pin: string) {
    console.log('[API] ===== LOGINUSER CALLED =====');
    console.log('[API] loginUser called with pin:', pin);
    console.log('[API] api instance available:', !!api);
    console.log('[API] api.post available:', !!api.post);
    
    try {
        console.log('[API] Making POST request to /api/login');
        const response = await api.post('/api/login', { pin });
        console.log('[API] Response received:', response);
        return response.data;
    } catch (error) {
        console.error('[API] Error in loginUser:', error);
        throw error;
    }
}

// Export the function
export const loginUser = loginUserImpl;

console.log('[API] ===== LOGINUSER FUNCTION EXPORTED =====');
console.log('[API] loginUser type:', typeof loginUser);
console.log('[API] loginUser function reference:', loginUser);
console.log('[API] loginUser.name:', loginUser.name);
console.log('[API] loginUser.length:', loginUser.length);

// Test the function is callable
try {
    console.log('[API] Testing function is callable...');
    console.log('[API] typeof loginUser === "function":', typeof loginUser === 'function');
    console.log('[API] loginUser instanceof Function:', loginUser instanceof Function);
} catch (e) {
    console.error('[API] Error testing function:', e);
}

// Ensure loginUser is available for debugging
if (typeof window !== 'undefined') {
    (window as any).loginUser = loginUser;
    (window as any).apiModule = { loginUser, api };
    console.log('[API] loginUser added to window object');
    console.log('[API] window.loginUser type:', typeof (window as any).loginUser);
} else {
    console.log('[API] window object not available');
}

export const createBoard = async (name: string) => {
    const response = await api.post('/api/boards', { name });
    return response.data;
};

// Export all functions as a default object as well for compatibility
export default {
    loginUser,
    createBoard,
    api
};
