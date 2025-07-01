import create from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: document.cookie.includes('session_id'),
    login: () => {
        // This is a simplified version. In a real app, you'd handle the session properly.
        set({ isAuthenticated: true });
    },
    logout: () => {
        // Clear the session cookie
        document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ isAuthenticated: false });
    },
}));
