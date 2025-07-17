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

export const useAuthStore = create<AuthState>()((set, get) => ({
    isAuthenticated: false,
    token: null,
    
    login: (token: string) => {
        console.log('🔐 AUTH STORE: Starting login with token:', token);
        console.log('🔐 AUTH STORE: Current state before set:', get());
        
        // Use functional update to ensure proper state setting
        set((state) => {
            console.log('🔐 AUTH STORE: Inside set function, previous state:', state);
            const newState = {
                ...state,
                isAuthenticated: true,
                token: token
            };
            console.log('🔐 AUTH STORE: Inside set function, new state:', newState);
            return newState;
        });
        
        // Verify the state was set correctly
        const currentState = get();
        console.log('🔐 AUTH STORE: State after set:', currentState);
        console.log('🔐 AUTH STORE: isAuthenticated:', currentState.isAuthenticated);
        console.log('🔐 AUTH STORE: token:', currentState.token);
        
        // Set the token in a cookie for API requests
        document.cookie = `session_id=${token}; path=/; max-age=86400`;
        console.log('🔐 AUTH STORE: Cookie set:', document.cookie);
        
        // Also store in localStorage as a backup
        try {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', token);
            console.log('🔐 AUTH STORE: localStorage updated');
        } catch (e) {
            console.error('Failed to store auth state in localStorage:', e);
        }
    },
    
    logout: () => {
        console.log('🔐 AUTH STORE: Logging out');
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
        console.log('🔐 AUTH STORE: Initializing auth');
        
        // Try to restore authentication state from cookie or localStorage
        const cookieToken = getTokenFromCookie();
        const storageToken = getTokenFromStorage();
        
        const token = cookieToken || storageToken;
        
        if (token) {
            console.log('🔐 AUTH STORE: Found existing token, restoring auth');
            set({ isAuthenticated: true, token });
            
            // Ensure cookie is set if we got token from localStorage
            if (!cookieToken && storageToken) {
                document.cookie = `session_id=${token}; path=/; max-age=86400`;
            }
        } else {
            console.log('🔐 AUTH STORE: No existing token found');
            set({ isAuthenticated: false, token: null });
        }
    }
}));
