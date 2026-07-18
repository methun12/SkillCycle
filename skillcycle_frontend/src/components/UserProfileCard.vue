<template>
  <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
    <div class="flex flex-col items-center md:flex-row md:items-start md:text-left text-center gap-6">
      <!-- Avatar -->
      <div class="flex-shrink-0 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-md">
        {{ user.initials }}
      </div>

      <!-- User Details -->
      <div class="flex-grow">
        <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
        <p class="text-gray-500">{{ user.email }}</p>

        <!-- Stats -->
        <div class="flex justify-center md:justify-start gap-6 mt-4 border-t pt-4">
          <div class="text-center">
            <!--
              THIS IS THE FIX:
              We use parseFloat() to convert the rating string (e.g., "5.00")
              into a number (e.g., 5) before calling .toFixed(1).
              We also add a check `(user.rating || 0)` to prevent errors if the rating is null or undefined.
            -->
            <p class="text-xl font-bold text-gray-800">
              {{ (parseFloat(user.rating) || 0).toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500">Avg. Rating</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold text-gray-800">{{ user.dealsCompleted }}</p>
            <p class="text-xs text-gray-500">Deals Done</p>
          </div>
        </div>
      </div>

      <!-- Edit Button -->
      <BaseButton variant="outline" size="sm">
        <template #icon><Pencil :size="14" /></template>
        Edit Profile
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/BaseButton.vue';
import { Pencil } from 'lucide-vue-next';

defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>