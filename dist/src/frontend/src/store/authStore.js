"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
exports.useAuthStore = (0, zustand_1.create)((set) => ({
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
