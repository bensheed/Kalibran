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
            console.log('[AUTH2] Token type:', typeof token);
            console.log('[AUTH2] Token length:', token ? token.length : 'null/undefined');
            
            if (!token) {
                console.error('[AUTH2] No token provided to login function!');
                return;
            }
            
            try {
                // Set both values together in a single call
                console.log('[AUTH2] Setting both isAuthenticated and token...');
                set({ isAuthenticated: true, token });
                
                // Verify the state was set correctly
                const currentState = get();
                console.log('[AUTH2] Final state after set:', currentState);
                console.log('[AUTH2] Final isAuthenticated:', currentState.isAuthenticated);
                console.log('[AUTH2] Final token:', currentState.token);
                console.log('[AUTH2] Final token type:', typeof currentState.token);
                
                // Verify token is actually stored
                if (currentState.token !== token) {
                    console.error('[AUTH2] TOKEN MISMATCH! Expected:', token, 'Got:', currentState.token);
                }
                
                // Set the token in a cookie for API requests
                document.cookie = `session_id=${token}; path=/; max-age=86400; SameSite=Lax`;
                console.log('[AUTH2] Cookie set with token:', token);
                
                // Also store in localStorage as a backup
                try {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('authToken', token);
                    console.log('[AUTH2] localStorage updated with token:', token);
                    
                    // Verify localStorage
                    const storedToken = localStorage.getItem('authToken');
                    console.log('[AUTH2] Verified localStorage token:', storedToken);
                } catch (e) {
                    console.error('[AUTH2] Failed to store auth state in localStorage:', e);
                }
                
                // Final verification
                setTimeout(() => {
                    const finalState = get();
                    console.log('[AUTH2] Final verification - state:', finalState);
                    console.log('[AUTH2] Final verification - token still there:', finalState.token === token);
                }, 100);
                
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
            
            console.log('[AUTH2] Cookie token:', cookieToken);
            console.log('[AUTH2] Storage token:', storageToken);
            
            const token = cookieToken || storageToken;
            
            if (token) {
                console.log('[AUTH2] Found existing token, restoring auth with token:', token);
                set({ isAuthenticated: true, token });
                
                // Ensure cookie is set if we got token from localStorage
                if (!cookieToken && storageToken) {
                    document.cookie = `session_id=${token}; path=/; max-age=86400; SameSite=Lax`;
                    console.log('[AUTH2] Set cookie from localStorage token');
                }
                
                // Verify the state was set
                const currentState = get();
                console.log('[AUTH2] State after initialization:', currentState);
                
            } else {
                console.log('[AUTH2] No existing token found, setting unauthenticated');
                set({ isAuthenticated: false, token: null });
            }
        }
    };
});