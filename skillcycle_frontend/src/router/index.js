import { createRouter, createWebHistory } from 'vue-router';
// Import the store to check the user's authentication status.
import { useAuthStore } from '@/store/auth';

// --- 1. Import all page components ---
import Dashboard from '../pages/Dashboard.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
import Matches from '../pages/Matches.vue';
import Deals from '../pages/Deals.vue';

// --- 2. Define the application's routes ---
const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
    },
    {
        path: '/matches',
        name: 'matches',
        component: Matches,
        meta: { requiresAuth: true },
    },
    {
        path: '/deals',
        name: 'deals',
        component: Deals,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { publicOnly: true },
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: { publicOnly: true },
    },
];

// --- 3. Create the router instance ---
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

/**
 * A simple helper function to introduce a small, non-blocking delay.
 * We use this to periodically check if the auth store is ready
 * without freezing the browser's main thread.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 4. Implement the Updated and Simplified Global Navigation Guard ---
// The `async` keyword is added to allow the use of `await` inside.
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // --- THE NEW, SIMPLER FIX ---
    // This loop will pause the navigation process until the authStore's
    // `isHydrated` flag (set by App.vue) becomes true.
    while (!authStore.isHydrated) {
        // Wait for a very short time (e.g., 10 milliseconds) and then check again.
        // This is more reliable than a one-time subscriber.
        await delay(10);
    }

    // --- Original Guard Logic ---
    // By the time the code execution reaches this point, we are 100% certain
    // that the authStore has been initialized from localStorage, and the token
    // (if any) is available in the state.
    const isAuthenticated = authStore.isAuthenticated;
    const requiresAuth = to.meta.requiresAuth;
    const publicOnly = to.meta.publicOnly;

    if (requiresAuth && !isAuthenticated) {
        // If the page requires login but the user is not authenticated,
        // redirect them to the login page.
        next({ name: 'login' });
    } else if (publicOnly && isAuthenticated) {
        // If the page is for guests only (like Login/Register) but the user
        // is already logged in, redirect them to the dashboard.
        next({ name: 'dashboard' });
    } else {
        // In all other cases, allow the navigation to proceed.
        next();
    }
});

// --- 5. Export the configured router ---
export default router;