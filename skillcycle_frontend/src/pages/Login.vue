<template>
  <div class="flex items-center justify-center min-h-[75vh] animate-fade-in px-4">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">

      <!-- Header -->
      <div class="text-center">
        <div class="inline-block p-3 bg-blue-100 rounded-full mb-2">
          <BookOpenCheck :size="32" class="text-blue-600"/>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Sign in to SkillCycle</h2>
        <p class="mt-2 text-sm text-gray-600">
          Welcome back! Please enter your details.
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- API Error Display -->
        <div v-if="apiError" class="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg" role="alert">
          {{ apiError }}
        </div>

        <!-- Email Input -->
        <BaseInput
            v-model="credentials.email"
            label="Email Address"
            type="email"
            id="email"
            placeholder="you@example.com"
            :error="errors.email"
            autocomplete="email"
            :disabled="isLoading"
        />

        <!-- Password Input -->
        <BaseInput
            v-model="credentials.password"
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            :error="errors.password"
            autocomplete="current-password"
            :disabled="isLoading"
        />

        <!-- Forgot Password Link -->
        <div class="text-right">
          <a href="#" class="text-sm font-medium text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
        <BaseButton type="submit" :loading="isLoading" fullWidth>
          Sign In
        </BaseButton>
      </form>

      <!-- Footer Link to Register Page -->
      <p class="text-sm text-center text-gray-600">
        Don't have an account?
        <router-link to="/register" class="font-medium text-blue-600 hover:underline">
          Sign up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { BookOpenCheck } from 'lucide-vue-next';

// Initialize router and Pinia auth store
const router = useRouter();
const authStore = useAuthStore();

// Reactive state for form data, errors, and loading status
const credentials = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
});

const apiError = ref(''); // For errors coming from the backend
const isLoading = ref(false);

// Function to validate the form before submission
const validateForm = () => {
  // Reset previous errors
  errors.email = '';
  errors.password = '';
  apiError.value = '';

  let isValid = true;

  // Basic email validation
  if (!credentials.email) {
    errors.email = 'Email address is required.';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
    errors.email = 'Please enter a valid email address.';
    isValid = false;
  }

  // Basic password validation
  if (!credentials.password) {
    errors.password = 'Password is required.';
    isValid = false;
  } else if (credentials.password.length < 6) {
    // This should match your backend validation rules
    errors.password = 'Password must be at least 6 characters long.';
    isValid = false;
  }

  return isValid;
};

// Main handler for the form submission
const handleLogin = async () => {
  if (!validateForm()) {
    return; // Stop if validation fails
  }

  isLoading.value = true;

  try {
    // Call the login action from the Pinia store
    await authStore.login(credentials);

    // On success, redirect to the dashboard
    router.push('/');

  } catch (error) {
    // Handle errors from the API (e.g., 401 Unauthorized)
    // The message is generic for security reasons
    apiError.value = 'The email or password you entered is incorrect.';
    console.error('Login failed:', error);
  } finally {
    // Ensure the loading state is turned off regardless of outcome
    isLoading.value = false;
  }
};
</script>