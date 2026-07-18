<template>
  <button
      :type="type"
      :class="buttonClasses"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <!-- Loading Spinner: shown when loading is true -->
    <div v-if="loading" class="flex items-center justify-center">
      <Loader2 class="h-5 w-5 animate-spin" />
    </div>

    <!-- Button Content: shown when not loading -->
    <div v-else class="flex items-center justify-center gap-2">
      <slot name="icon"></slot>
      <slot>
        <!-- Default slot content if nothing is provided -->
        <span>Button</span>
      </slot>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

// Define component props with types and default values
const props = defineProps({
  // The HTML button type
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  // The visual style of the button
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'outline'].includes(value),
  },
  // The size of the button
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  // Whether the button is disabled
  disabled: {
    type: Boolean,
    default: false,
  },
  // Whether the button is in a loading state
  loading: {
    type: Boolean,
    default: false,
  },
  // Whether the button should take up the full width of its container
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

// Define the event that this component can emit
const emit = defineEmits(['click']);

// Handler for the click event
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

// A computed property to dynamically generate the button's CSS classes
const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'rounded-lg',
    'shadow-sm',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  // --- Variant Classes ---
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
  };

  // --- Size Classes ---
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // --- State Classes ---
  if (props.disabled || props.loading) {
    baseClasses.push('opacity-60', 'cursor-not-allowed');
  }

  if (props.fullWidth) {
    baseClasses.push('w-full');
  }

  return [
    ...baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
  ];
});
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>