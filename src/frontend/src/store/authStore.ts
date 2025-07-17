import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    test: () => void;
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
    
    // Test function to verify store is working
    test: () => {
        console.log('[AUTH] Test function called');
        set({ token: 'test-token' });
        console.log('[AUTH] Test function completed, state:', get());
    },
    
    login: (token: string) => {
        console.log('[AUTH] Starting login with token:', token);
        console.log('[AUTH] Current state before set:', get());
        
        // Use functional update to ensure proper state setting
        set((state) => {
            console.log('[AUTH] Inside set function, previous state:', state);
            const newState = {
                ...state,
                isAuthenticated: true,
                token: token
            };
            console.log('[AUTH] Inside set function, new state:', newState);
            return newState;
        });
        
        // Verify the state was set correctly
        const currentState = get();
        console.log('[AUTH] State after set:', currentState);
        console.log('[AUTH] isAuthenticated:', currentState.isAuthenticated);
        console.log('[AUTH] token:', currentState.token);
        
        // Set the token in a cookie for API requests
        document.cookie = `session_id=${token}; path=/; max-age=86400`;
        console.log('[AUTH] Cookie set:', document.cookie);
        
        // Also store in localStorage as a backup
        try {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', token);
            console.log('[AUTH] localStorage updated');
        } catch (e) {
            console.error('[AUTH] Failed to store auth state in localStorage:', e);
        }
    },
    
    logout: () => {
        console.log('[AUTH] Logging out');
        document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ isAuthenticated: false, token: null });
        
        // Also clear from localStorage
        try {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authToken');
        } catch (e) {
            console.error('[AUTH] Failed to remove auth state from localStorage:', e);
        }
    },
    
    initializeAuth: () => {
        console.log('[AUTH] Initializing auth');
        
        // Try to restore authentication state from cookie or localStorage
        const cookieToken = getTokenFromCookie();
        const storageToken = getTokenFromStorage();
        
        const token = cookieToken || storageToken;
        
        if (token) {
            console.log('[AUTH] Found existing token, restoring auth');
            set({ isAuthenticated: true, token });
            
            // Ensure cookie is set if we got token from localStorage
            if (!cookieToken && storageToken) {
                document.cookie = `session_id=${token}; path=/; max-age=86400`;
            }
        } else {
            console.log('[AUTH] No existing token found');
            set({ isAuthenticated: false, token: null });
        }
    }
}));
