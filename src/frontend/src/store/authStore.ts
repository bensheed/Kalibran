import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    initializeAuth: () => void;
}

// Helper function to get token from cookie
const getTokenFromCookie = (): string | null => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'session_id' && value) {
            return value;
        }
    }
    return null;
};

// Helper function to get token from localStorage
const getTokenFromStorage = (): string | null => {
    try {
        const isAuth = localStorage.getItem('isAuthenticated');
        const token = localStorage.getItem('authToken');
        if (isAuth === 'true' && token) {
            return token;
        }
    } catch (e) {
        console.error('Failed to read from localStorage:', e);
    }
    return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    token: null,
    login: (token: string) => {
        console.log('Setting isAuthenticated to true with token:', token);
        set({ isAuthenticated: true, token });
        
        // Use get() instead of useAuthStore.getState() to avoid circular reference
        const state = get();
        console.log('Auth state after setting:', state.isAuthenticated);
        console.log('Token after setting:', state.token);
        
        // Set the token in a cookie for API requests
        document.cookie = `session_id=${token}; path=/; max-age=86400`;
        
        // Also store in localStorage as a backup
        try {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', token);
        } catch (e) {
            console.error('Failed to store auth state in localStorage:', e);
        }
    },
    logout: () => {
        console.log('Logging out, clearing session cookie');
        document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ isAuthenticated: false, token: null });
        
        // Also clear from localStorage
        try {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authToken');
        } catch (e) {
            console.error('Failed to remove auth state from localStorage:', e);
        }
    },
    initializeAuth: () => {
        // Try to restore authentication state from cookie or localStorage
        const cookieToken = getTokenFromCookie();
        const storageToken = getTokenFromStorage();
        
        const token = cookieToken || storageToken;
        
        if (token) {
            console.log('Initializing auth with existing token:', token);
            set({ isAuthenticated: true, token });
            
            // Ensure cookie is set if we got token from localStorage
            if (!cookieToken && storageToken) {
                document.cookie = `session_id=${token}; path=/; max-age=86400`;
            }
        } else {
            console.log('No existing token found during initialization');
            set({ isAuthenticated: false, token: null });
        }
    }
}));
