<template>
  <div class="flex items-center justify-center min-h-[80vh] animate-fade-in px-4 py-8">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">

      <!-- Header -->
      <div class="text-center">
        <div class="inline-block p-3 bg-blue-100 rounded-full mb-2">
          <UserPlus :size="32" class="text-blue-600"/>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Create an Account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Join SkillCycle to start exchanging skills!
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-5">
        <!-- API Error Display -->
        <div v-if="apiError" class="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg" role="alert">
          {{ apiError }}
        </div>

        <!-- Full Name Input -->
        <BaseInput
            v-model="formData.name"
            label="Full Name"
            type="text"
            id="name"
            placeholder="e.g., Tanvir Ahmed"
            :error="errors.name"
            autocomplete="name"
            :disabled="isLoading"
        />

        <!-- Email Input -->
        <BaseInput
            v-model="formData.email"
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
            v-model="formData.password"
            label="Password"
            type="password"
            id="password"
            placeholder="Minimum 6 characters"
            :error="errors.password"
            autocomplete="new-password"
            :disabled="isLoading"
        />

        <!-- Confirm Password Input -->
        <BaseInput
            v-model="formData.passwordConfirm"
            label="Confirm Password"
            type="password"
            id="passwordConfirm"
            placeholder="Re-enter your password"
            :error="errors.passwordConfirm"
            autocomplete="new-password"
            :disabled="isLoading"
        />

        <!-- Submit Button -->
        <BaseButton type="submit" :loading="isLoading" fullWidth class="!mt-8">
          Create Account
        </BaseButton>
      </form>

      <!-- Footer Link to Login Page -->
      <p class="text-sm text-center text-gray-600">
        Already have an account?
        <router-link to="/login" class="font-medium text-blue-600 hover:underline">
          Sign in
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
import { UserPlus } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// Reactive state for form data, validation errors, and loading status
const formData = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
});

const apiError = ref('');
const isLoading = ref(false);

const validateForm = () => {
  // Reset all previous errors
  Object.keys(errors).forEach(key => errors[key] = '');
  apiError.value = '';
  let isValid = true;

  if (!formData.name.trim()) {
    errors.name = 'Full name is required.';
    isValid = false;
  }

  if (!formData.email) {
    errors.email = 'Email address is required.';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Please enter a valid email address.';
    isValid = false;
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
    isValid = false;
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
    isValid = false;
  }

  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match.';
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // Call the register action from the Pinia store
    await authStore.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    // On successful registration and login, redirect to the dashboard
    router.push('/');

  } catch (error) {
    // Handle specific errors from the backend
    if (error.response && error.response.status === 409) { // 409 Conflict
      apiError.value = 'An account with this email address already exists.';
    } else {
      apiError.value = 'An unexpected error occurred. Please try again.';
    }
    console.error('Registration failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>