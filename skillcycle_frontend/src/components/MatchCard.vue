<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <div class="p-6">
      <!-- User Info Header -->
      <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
          <!-- Check if user exists before accessing initials -->
          {{ user?.initials }}
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">{{ user?.name }}</h3>
          <div class="flex items-center gap-1 text-sm text-gray-500">
            <Star :size="16" class="text-yellow-500 fill-current" />
            <!-- Safely convert rating to a number and format it -->
            <span>{{ (parseFloat(user?.rating) || 0).toFixed(1) }} Average Rating</span>
          </div>
        </div>
      </div>

      <!-- Skill Exchange Details -->
      <div class="space-y-4">
        <!-- They Offer (What you get) -->
        <div class="p-3 bg-green-50 rounded-lg border border-green-200">
          <p class="text-xs text-green-800 font-semibold mb-1">THEY OFFER (YOU NEED)</p>
          <div class="flex flex-wrap gap-2">
            <!-- Loop through the 'theyOffer' array -->
            <span v-for="skill in skills?.theyOffer" :key="skill" class="skill-badge bg-green-100 text-green-800">
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- You Offer (What they need) -->
        <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs text-blue-800 font-semibold mb-1">YOU OFFER (THEY NEED)</p>
          <div class="flex flex-wrap gap-2">
            <!-- Loop through the 'youOffer' array -->
            <span v-for="skill in skills?.youOffer" :key="skill" class="skill-badge bg-blue-100 text-blue-800">
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons Footer -->
    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
      <BaseButton variant="primary" @click="$emit('accept', matchId)" fullWidth>
        <template #icon><Check :size="16" /></template>
        Accept
      </BaseButton>
      <BaseButton variant="outline" @click="$emit('decline', matchId)" fullWidth>
        <template #icon><X :size="16" /></template>
        Decline
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/BaseButton.vue';
import { Star, Check, X } from 'lucide-vue-next';

// --- THIS IS THE CRITICAL PART ---
// This `defineProps` block explicitly tells Vue what data to expect.
// If this doesn't match what the parent is sending, nothing will render.
defineProps({
  matchId: {
    type: [String, Number],
    required: true,
  },
  user: {
    type: Object,
    required: true,
    // It's good practice to provide a default factory function
    default: () => ({ name: 'Unknown User', initials: '??', rating: 0 })
  },
  skills: {
    type: Object,
    required: true,
    default: () => ({ theyOffer: [], youOffer: [] })
  }
});

defineEmits(['accept', 'decline']);
</script>

<style scoped>
.skill-badge {
  @apply text-xs font-medium px-2.5 py-1 rounded-full;
}
</style>