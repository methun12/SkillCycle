<template>
  <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
    <nav class="container mx-auto px-4 lg:px-6 py-3 flex justify-between items-center">

      <!-- Logo and Brand Name -->
      <router-link to="/" class="flex items-center gap-2 text-2xl font-bold text-gray-900 transition-transform hover:scale-105">
        <BookOpenCheck :size="28" class="text-blue-600" />
        <span>SkillCycle</span>
      </router-link>

      <!-- Main Navigation Links (for logged-in users) -->
      <div class="hidden md:flex items-center space-x-6" v-if="authStore.isAuthenticated">
        <!-- Each link uses <router-link> with a 'to' path -->
        <router-link to="/" class="nav-link">
          <LayoutDashboard :size="20" />
          <span>Dashboard</span>
        </router-link>
        <router-link to="/matches" class="nav-link">
          <Users :size="20" />
          <span>Matches</span>
        </router-link>
        <router-link to="/deals" class="nav-link">
          <Handshake :size="20" />
          <span>Deals</span>
        </router-link>
        <router-link to="/profile" class="nav-link">
          <UserCircle :size="20" />
          <span>Profile</span>
        </router-link>
      </div>

      <!-- Action Buttons (Login/Register or Logout) -->
      <div class="flex items-center space-x-2">
        <!-- Authenticated User View -->
        <template v-if="authStore.isAuthenticated">
          <button @click="handleLogout" class="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
            <LogOut :size="18" />
            <span>Logout</span>
          </button>
        </template>

        <!-- Guest View -->
        <template v-else>
          <router-link to="/login" class="text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
            Login
          </router-link>
          <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm">
            Register
          </router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
// Import RouterLink for the template and useRouter for the script logic
import { RouterLink, useRouter } from 'vue-router';
// Import the Pinia store to check authentication status
import { useAuthStore } from '@/store/auth';
// Import all necessary icons
import {
  BookOpenCheck,
  LayoutDashboard,
  Users,
  Handshake,
  UserCircle,
  LogOut
} from 'lucide-vue-next';

// Initialize the Pinia store and Vue router
const authStore = useAuthStore();
const router = useRouter();

/**
 * Handles the user logout process.
 * 1. Calls the auth store to clear the session state (user, token, localStorage).
 * 2. Programmatically redirects the user to the login page.
 * This is the correct pattern to avoid circular dependencies.
 */
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/*
  Custom styles for navigation links to keep the template clean.
  Using Tailwind's @apply directive.
*/
.nav-link {
  @apply flex items-center gap-2 text-gray-600 font-medium transition-colors duration-200;
}

.nav-link:hover {
  @apply text-blue-600;
}

/*
  Style for the active route link.
  Vue Router automatically applies the `router-link-exact-active` class to the
  link that corresponds to the currently displayed page. This provides crucial
  visual feedback to the user.
*/
.router-link-exact-active.nav-link {
  @apply text-blue-600;
}
</style>