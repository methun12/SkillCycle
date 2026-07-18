<template>
  <div class="w-full">
    <!-- Label with an optional check to prevent rendering if no label is provided -->
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <div class="relative">
      <!-- The main input field -->
      <input
          :id="inputId"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="inputClasses"
          :autocomplete="autocomplete"
          @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- Error Message Display -->
    <!-- It animates in for a smoother user experience -->
    <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
    >
      <p v-if="error" class="mt-1 text-sm text-red-600" role="alert">
        {{ error }}
      </p>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Define component props with clear types, defaults, and validators
const props = defineProps({
  // The value of the input, for v-model
  modelValue: {
    type: [String, Number],
    default: '',
  },
  // The text for the <label> element
  label: {
    type: String,
    default: '',
  },
  // The input's type (e.g., 'text', 'password', 'email', 'number')
  type: {
    type: String,
    default: 'text',
  },
  // The placeholder text
  placeholder: {
    type: String,
    default: '',
  },
  // An error message to display below the input
  error: {
    type: String,
    default: '',
  },
  // Whether the input is disabled
  disabled: {
    type: Boolean,
    default: false,
  },
  // A unique identifier for the input, useful for forms
  id: {
    type: String,
    default: null,
  },
  // HTML autocomplete attribute
  autocomplete: {
    type: String,
    default: 'off',
  },
});

// Define the event emitted for v-model to work
defineEmits(['update:modelValue']);

// A computed property to generate a unique ID for the input and label.
// This is crucial for accessibility, linking the label to the input.
const inputId = computed(() => {
  return props.id || `base-input-${crypto.randomUUID()}`;
});

// A computed property to dynamically apply TailwindCSS classes
// based on the component's state (e.g., if there's an error).
const inputClasses = computed(() => [
  'block w-full px-3 py-2 text-base text-gray-900',
  'border rounded-lg shadow-sm',
  'placeholder-gray-400',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
  'transition-colors duration-200 ease-in-out',
  {
    // Normal state
    'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !props.error,
    // Error state
    'border-red-400 focus:ring-red-500 focus:border-red-500': props.error,
    // Disabled state
    'bg-gray-100 text-gray-500 cursor-not-allowed': props.disabled,
  },
]);
</script>

<style scoped>
/* All styles are handled by TailwindCSS classes in the template */
</style>