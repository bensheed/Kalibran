import { create } from 'zustand';

console.log('[AUTH2_FILE] Auth store 2 file is being loaded');

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
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'session_id') {
            return value;
        }
    }
    return null;
};

// Helper function to get token from localStorage
const getTokenFromStorage = (): string | null => {
    try {
        return localStorage.getItem('authToken');
    } catch (e) {
        console.error('[AUTH2] Failed to access localStorage:', e);
    }
    return null;
};

console.log('[AUTH2_FILE] About to create auth store 2');

export const useAuthStore2 = create<AuthState>((set, get) => {
    console.log('[AUTH2] Store created, set function type:', typeof set);
    console.log('[AUTH2] Store created, get function type:', typeof get);
    
    return {
        isAuthenticated: false,
        token: null,
        
        // Test function to verify store is working
        test: () => {
            console.log('[AUTH2] Test function called');
            console.log('[AUTH2] About to call set with test token');
            console.log('[AUTH2] set function type in test:', typeof set);
            
            try {
                set({ token: 'test-token' });
                console.log('[AUTH2] Set call completed');
                console.log('[AUTH2] Test function completed, state:', get());
            } catch (error) {
                console.error('[AUTH2] Error in test function set call:', error);
                throw error;
            }
        },
        
        login: (token: string) => {
            console.log('[AUTH2] Starting login with token:', token);
            console.log('[AUTH2] Current state before set:', get());
            console.log('[AUTH2] set function type in login:', typeof set);
            
            try {
                // Use simple object update first
                set({ isAuthenticated: true, token });
                
                // Verify the state was set correctly
                const currentState = get();
                console.log('[AUTH2] State after set:', currentState);
                console.log('[AUTH2] isAuthenticated:', currentState.isAuthenticated);
                console.log('[AUTH2] token:', currentState.token);
                
                // Set the token in a cookie for API requests
                document.cookie = `session_id=${token}; path=/; max-age=86400`;
                console.log('[AUTH2] Cookie set:', document.cookie);
                
                // Also store in localStorage as a backup
                try {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('authToken', token);
                    console.log('[AUTH2] localStorage updated');
                } catch (e) {
                    console.error('[AUTH2] Failed to store auth state in localStorage:', e);
                }
            } catch (error) {
                console.error('[AUTH2] Error in login function:', error);
                throw error;
            }
        },
        
        logout: () => {
            console.log('[AUTH2] Logging out');
            document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            set({ isAuthenticated: false, token: null });
            
            // Also clear from localStorage
            try {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('authToken');
            } catch (e) {
                console.error('[AUTH2] Failed to remove auth state from localStorage:', e);
            }
        },
        
        initializeAuth: () => {
            console.log('[AUTH2] Initializing auth');
            
            // Try to restore authentication state from cookie or localStorage
            const cookieToken = getTokenFromCookie();
            const storageToken = getTokenFromStorage();
            
            const token = cookieToken || storageToken;
            
            if (token) {
                console.log('[AUTH2] Found existing token, restoring auth');
                set({ isAuthenticated: true, token });
                
                // Ensure cookie is set if we got token from localStorage
                if (!cookieToken && storageToken) {
                    document.cookie = `session_id=${token}; path=/; max-age=86400`;
                }
            } else {
                console.log('[AUTH2] No existing token found');
                set({ isAuthenticated: false, token: null });
            }
        }
    };
});