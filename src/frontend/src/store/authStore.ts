import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    token: null,
    login: (token: string) => {
        console.log('Setting isAuthenticated to true with token:', token);
        set({ isAuthenticated: true, token });
        console.log('Auth state after setting:', useAuthStore.getState().isAuthenticated);
        
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
    }
}));
