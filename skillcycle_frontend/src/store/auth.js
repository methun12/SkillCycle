import { defineStore } from 'pinia';
import apiClient from '../services/api';

/**
 * Helper function to safely parse the user object from localStorage.
 * This prevents the app from crashing if the stored data is malformed.
 * @returns {object | null} The parsed user object or null.
 */
const getUserFromStorage = () => {
    const user = localStorage.getItem('user');
    try {
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('user'); // Clear the corrupted data
        return null;
    }
};

export const useAuthStore = defineStore('auth', {
    /**
     * --- STATE ---
     * The single source of truth for authentication.
     */
    state: () => ({
        // The user object, loaded from localStorage for session persistence.
        user: getUserFromStorage(),
        // The JWT, loaded from localStorage.
        token: localStorage.getItem('token') || null,
        // **NEW**: A flag to track if the store has been initialized from localStorage.
        // This is crucial to prevent race conditions on app startup.
        isHydrated: false,
    }),

    /**
     * --- GETTERS ---
     * Computed properties derived from the state.
     */
    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        userName: (state) => state.user?.name || 'Guest',
        userInitials: (state) => {
            if (state.user?.name) {
                const parts = state.user.name.trim().split(' ');
                if (parts.length > 1) {
                    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                }
                return parts[0].substring(0, 2).toUpperCase();
            }
            return '??';
        },
    },

    /**
     * --- ACTIONS ---
     * Methods used to change the state.
     */
    actions: {
        /**
         * **NEW**: Marks the store as hydrated (initialized).
         * This action is called from the root App.vue component once it mounts,
         * signaling that the initial state has been loaded and the app can proceed.
         */
        setHydrated() {
            this.isHydrated = true;
        },

        /**
         * Attempts to log in a user with the given credentials.
         * @param {object} credentials - The user's email and password.
         */
        async login(credentials) {
            try {
                const response = await apiClient.post('/auth/login', credentials);
                const { token, user } = response.data;
                this.setUserAndToken(user, token);
            } catch (error) {
                this.clearUserAndToken();
                console.error('Login failed in auth store:', error);
                throw error;
            }
        },

        /**
         * Registers a new user and automatically logs them in upon success.
         * @param {object} userInfo - The user's name, email, and password.
         */
        async register(userInfo) {
            try {
                const response = await apiClient.post('/auth/register', userInfo);
                const { token, user } = response.data;
                this.setUserAndToken(user, token);
            } catch (error) {
                this.clearUserAndToken();
                console.error('Registration failed in auth store:', error);
                throw error;
            }
        },

        /**
         * Logs the user out by clearing state and storage.
         * The component that calls this action is responsible for redirecting the user.
         */
        logout() {
            this.clearUserAndToken();
            console.log('User logged out. State cleared.');
        },

        /**
         * Private helper action to set user and token in state and localStorage.
         * @param {object} userData - The user object from the API.
         * @param {string} tokenData - The JWT from the API.
         */
        setUserAndToken(userData, tokenData) {
            this.user = userData;
            this.token = tokenData;
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', tokenData);
        },

        /**
         * Private helper action to clear user and token from state and localStorage.
         */
        clearUserAndToken() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});