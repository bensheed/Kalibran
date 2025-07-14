import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    login: () => {
        set({ isAuthenticated: true });
    },
    logout: () => {
        document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ isAuthenticated: false });
    }
}));
