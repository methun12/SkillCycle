<template>
  <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
    <!-- Component Header -->
    <div class="flex items-center gap-3 mb-4">
      <div :class="`p-2 rounded-full ${iconBgColor}`">
        <component :is="icon" :size="20" :class="iconColor" />
      </div>
      <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
    </div>
    <p class="text-sm text-gray-500 mb-4">{{ subtitle }}</p>

    <!-- Form to Add a New Skill -->
    <form @submit.prevent="onAddSkill" class="flex gap-2 mb-4">
      <BaseInput
          v-model="newSkillName"
          :placeholder="placeholder"
          class="flex-grow"
      />
      <BaseButton type="submit" :disabled="!newSkillName.trim()">
        Add
      </BaseButton>
    </form>

    <!-- List of Existing Skills -->
    <div class="flex-grow overflow-y-auto pr-2 -mr-2">
      <!-- Show list if skills exist -->
      <ul v-if="skills && skills.length > 0" class="space-y-2">
        <li
            v-for="skill in skills"
            :key="skill.id"
            class="flex items-center justify-between bg-gray-50 p-3 rounded-lg animate-fade-in"
        >
          <!-- Display the skill's name -->
          <span class="font-medium text-gray-700">{{ skill.skill_name }}</span>

          <!-- Remove button: emits the ENTIRE skill object -->
          <button @click="$emit('remove-skill', skill)" class="text-gray-400 hover:text-red-500 transition-colors">
            <XCircle :size="20" />
          </button>
        </li>
      </ul>
      <!-- Show empty state message if no skills exist -->
      <div v-else class="text-center text-sm text-gray-400 py-8">
        No skills added yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { XCircle } from 'lucide-vue-next';

// --- Props Definition ---
// Defines the data this component expects to receive from its parent (Profile.vue)
defineProps({
  title: String,
  subtitle: String,
  placeholder: String,
  // Expects an array of objects, where each object is a skill with an `id` and `skill_name`
  skills: {
    type: Array,
    required: true,
  },
  icon: Object, // The icon component (e.g., Award, Lightbulb)
  iconBgColor: String, // e.g., 'bg-blue-100'
  iconColor: String, // e.g., 'text-blue-600'
});

// --- Emits Definition ---
// Defines the custom events this component can send to its parent
const emit = defineEmits(['add-skill', 'remove-skill']);

// --- Local State ---
// `newSkillName` holds the value of the text input field
const newSkillName = ref('');

/**
 * Handles the form submission for adding a new skill.
 */
const onAddSkill = () => {
  const trimmedSkillName = newSkillName.value.trim();
  // Only emit the event if the input is not empty
  if (trimmedSkillName) {
    // Send the new skill name up to the Profile.vue parent component
    emit('add-skill', trimmedSkillName);
    // Clear the input field after submission
    newSkillName.value = '';
  }
};

// Note: The 'remove-skill' logic is handled directly in the template
// with `@click="$emit('remove-skill', skill)"` for simplicity.

</script>