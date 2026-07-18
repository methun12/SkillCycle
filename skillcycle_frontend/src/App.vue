<template>
  <!--
    STEP 1: Show a global loading screen.
    This `v-if` checks the `isHydrated` flag from our auth store. While it's false,
    this is the ONLY thing on the screen. This prevents the rest of the app,
    including the <router-view>, from trying to render and make API calls prematurely.
  -->
  <div v-if="!authStore.isHydrated" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <p class="text-lg font-semibold text-gray-700 animate-pulse">
        Loading Application...
      </p>
      <!-- For a better UI, you could add a dedicated spinner component here -->
    </div>
  </div>

  <!--
    STEP 2: Show the main application layout.
    This `v-else` block will only be rendered AFTER the `isHydrated` flag in the
    store becomes true. By this time, we are guaranteed that the token and user
    data have been loaded from localStorage.
  -->
  <div v-else class="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
    <AppHeader />

    <main class="flex-grow w-full p-4 sm:p-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import { useAuthStore } from './store/auth';

// Get a reference to the authentication store.
const authStore = useAuthStore();

/**
 * --- The Core of the Fix ---
 * The onMounted lifecycle hook runs only once, when the App.vue component is first
 * mounted to the DOM. This is the earliest reliable point in the application's
 * lifecycle.
 *
 * By the time this hook runs, the Pinia store has already been created and has
 * synchronously loaded its initial state from localStorage.
 *
 * We then call the `setHydrated()` action to flip the `isHydrated` flag in our
 * store from `false` to `true`. This causes the `v-if` in the template to switch,
 * hiding the loading screen and showing the main application.
 */
onMounted(() => {
  authStore.setHydrated();
});
</script>

<style>
/* Global styles for the page transition. This part remains unchanged. */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>