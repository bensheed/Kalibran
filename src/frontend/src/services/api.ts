import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// FORCE CORRECT URL - This should result in http://localhost:3001/api/login
const API_URL = 'http://localhost:3001';

alert(`API CONFIGURATION DEBUG:\nAPI_URL variable: ${API_URL}\nThis should NOT contain /api at the end`);

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// DEBUGGING: Alert the baseURL immediately after creation
alert(`IMMEDIATE AFTER CREATION:\nbaseURL: ${api.defaults.baseURL}\nShould be: http://localhost:3001`);

// DEBUGGING: Set up a property watcher to catch when baseURL changes
let originalBaseURL = api.defaults.baseURL;
Object.defineProperty(api.defaults, 'baseURL', {
    get() {
        return originalBaseURL;
    },
    set(newValue) {
        alert(`BASEURL CHANGED!\nFROM: ${originalBaseURL}\nTO: ${newValue}`);
        originalBaseURL = newValue;
    }
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

        console.log('=== API REQUEST DEBUG ===');
        console.log('URL:', config.url || '');
        console.log('Method:', config.method || '');
        console.log('BaseURL:', config.baseURL || '');
        console.log('Full URL:', (config.baseURL || '') + (config.url || ''));
        console.log('Data:', config.data);
        console.log('========================');
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

export default api;
