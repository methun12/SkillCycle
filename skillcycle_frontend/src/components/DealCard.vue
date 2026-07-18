<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-200">
    <div class="p-6">
      <!-- Card Header: Partner Name and Status -->
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-sm text-gray-500">Your Deal With</p>
          <h3 class="text-xl font-bold text-gray-900">{{ partnerName }}</h3>
        </div>
        <span :class="statusInfo.badgeClass" class="px-3 py-1 text-xs font-semibold rounded-full">
          {{ statusInfo.text }}
        </span>
      </div>

      <!-- Card Body: Skill Exchange Details -->
      <div class="space-y-4 my-6">
        <!-- You Get (Skill to Learn) -->
        <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div class="flex-shrink-0 bg-green-100 p-2 rounded-full">
            <ArrowDownCircle :size="20" class="text-green-600" />
          </div>
          <div>
            <p class="text-xs text-green-800 font-semibold">YOU GET</p>
            <p class="text-md font-medium text-gray-800">{{ skillToLearn }}</p>
          </div>
        </div>

        <!-- You Give (Skill to Teach) -->
        <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex-shrink-0 bg-blue-100 p-2 rounded-full">
            <ArrowUpCircle :size="20" class="text-blue-600" />
          </div>
          <div>
            <p class="text-xs text-blue-800 font-semibold">YOU GIVE</p>
            <p class="text-md font-medium text-gray-800">{{ skillToTeach }}</p>
          </div>
        </div>
      </div>

      <!-- Card Footer: Deadline and Actions -->
      <div class="border-t border-gray-200 pt-4">
        <div class="flex justify-between items-center">
          <!-- Deadline -->
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Calendar :size="16" />
            <span>Deadline: {{ formattedDeadline }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <BaseButton
                v-if="status === 'in_progress'"
                variant="primary"
                size="sm"
                @click="onComplete"
            >
              Mark as Complete
            </BaseButton>

            <BaseButton
                v-if="status === 'completed'"
                variant="secondary"
                size="sm"
                @click="onRate"
            >
              Rate Partner
            </BaseButton>

            <BaseButton
                v-if="status === 'in_progress'"
                variant="outline"
                size="sm"
                @click="onCancel"
            >
              Cancel
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
import { ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-vue-next';

// Define the component's props
const props = defineProps({
  dealId: {
    type: [String, Number],
    required: true,
  },
  skillToLearn: {
    type: String,
    required: true,
  },
  skillToTeach: {
    type: String,
    required: true,
  },
  partnerName: {
    type: String,
    required: true,
  },
  deadline: {
    type: String, // Expecting an ISO date string, e.g., "2025-12-31T23:59:59.000Z"
    required: true,
  },
  status: {
    type: String,
    required: true,
    validator: (value) => ['in_progress', 'completed', 'cancelled'].includes(value),
  },
});

// Define the events this component can emit
const emit = defineEmits(['complete-deal', 'rate-deal', 'cancel-deal']);

// Format the deadline date for display
const formattedDeadline = computed(() => {
  if (!props.deadline) return 'N/A';
  return new Date(props.deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Computed property to determine the class and text for the status badge
const statusInfo = computed(() => {
  switch (props.status) {
    case 'completed':
      return {
        text: 'Completed',
        badgeClass: 'bg-green-100 text-green-800',
      };
    case 'cancelled':
      return {
        text: 'Cancelled',
        badgeClass: 'bg-gray-100 text-gray-800',
      };
    case 'in_progress':
    default:
      return {
        text: 'In Progress',
        badgeClass: 'bg-blue-100 text-blue-800',
      };
  }
});

// Event handlers that emit events to the parent component
const onComplete = () => {
  emit('complete-deal', props.dealId);
};

const onRate = () => {
  emit('rate-deal', props.dealId);
};

const onCancel = () => {
  emit('cancel-deal', props.dealId);
};
</script>