<template>
  <div class="container mx-auto animate-fade-in">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
      <p class="text-gray-600 mt-1">Keep your skills updated to get the best matches.</p>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="isLoading" class="space-y-8 animate-pulse">
      <div class="h-40 bg-gray-200 rounded-xl"></div>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="h-96 bg-gray-200 rounded-xl"></div>
        <div class="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>

    <!-- Profile Content (v-else ensures this only shows after loading is complete) -->
    <div v-else class="space-y-8">
      <!-- User Info Card -->
      <UserProfileCard :user="user" />

      <!-- Skill Management Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Skills I Have Manager -->
        <SkillManager
            title="Skills I Have"
            subtitle="These are the skills you can offer to teach others."
            placeholder="e.g., Python, Figma, Public Speaking"
            :skills="user.skillsHave"
            :icon="Award"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            @add-skill="addSkillHave"
            @remove-skill="removeSkillHave"
        />

        <!-- Skills I Want Manager -->
        <SkillManager
            title="Skills I Want"
            subtitle="These are the skills you want to learn from others."
            placeholder="e.g., Video Editing, SEO, Data Analysis"
            :skills="user.skillsWant"
            :icon="Lightbulb"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            @add-skill="addSkillWant"
            @remove-skill="removeSkillWant"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth';
import UserProfileCard from '@/components/UserProfileCard.vue';
import SkillManager from '@/components/SkillManager.vue';
import { Award, Lightbulb } from 'lucide-vue-next';

// --- State Management ---
const isLoading = ref(true);
const authStore = useAuthStore();
const user = ref({
  // Default structure to prevent template errors before data is loaded
  name: authStore.userName,
  initials: authStore.userInitials,
  email: authStore.user?.email,
  rating: authStore.user?.rating || 0,
  dealsCompleted: 0, // This could be fetched from another endpoint
  skillsHave: [], // This will now hold objects like { id: 1, skill_name: 'Vue.js' }
  skillsWant: [], // This will also hold objects
});


// --- Data Fetching ---
/**
 * Fetches the user's full skill profile from the backend when the component mounts.
 */
const fetchUserProfile = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/skills/my-skills');
    const { skillsHave, skillsWant } = response.data;

    // Update the local state with the data from the database
    user.value.skillsHave = skillsHave;
    user.value.skillsWant = skillsWant;

  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // Optionally show an error message to the user
  } finally {
    isLoading.value = false;
  }
};

// Run the fetch function when the component is first created.
onMounted(fetchUserProfile);


// --- Event Handlers for "Skills I Have" ---

/**
 * Adds a new "have" skill. Makes an API call to save it to the database
 * and then updates the local state for immediate UI feedback.
 * @param {string} skillName - The name of the skill to add.
 */
const addSkillHave = async (skillName) => {
  try {
    const response = await apiClient.post('/skills/have', {
      skill_name: skillName,
      level: 'Intermediate' // Default level, can be expanded in SkillManager later
    });

    // Add the new skill object returned from the API to the local list
    user.value.skillsHave.push(response.data.skill);
  } catch (error) {
    console.error("Failed to add 'have' skill:", error);
    alert(`Error: ${error.response?.data?.message || 'Could not add skill.'}`);
  }
};

/**
 * Removes a "have" skill. Makes an API call to delete it from the database
 * and then filters the local state to update the UI.
 * @param {object} skillToRemove - The skill object to remove (e.g., { id: 1, ... }).
 */
const removeSkillHave = async (skillToRemove) => {
  try {
    // Make the API call to delete the skill by its ID
    await apiClient.delete(`/skills/have/${skillToRemove.id}`);

    // Filter the skill out of the local array for an instant UI update
    user.value.skillsHave = user.value.skillsHave.filter(s => s.id !== skillToRemove.id);
  } catch (error) {
    console.error("Failed to remove 'have' skill:", error);
    alert('Error: Could not remove skill.');
  }
};


// --- Event Handlers for "Skills I Want" ---

/**
 * Adds a new "want" skill.
 * @param {string} skillName - The name of the skill to add.
 */
const addSkillWant = async (skillName) => {
  try {
    const response = await apiClient.post('/skills/need', {
      skill_name: skillName,
      urgency_level: 'Medium' // Default level
    });

    // Add the new need object returned from the API to the local list
    user.value.skillsWant.push(response.data.need);
  } catch (error){
  console.error("Failed to add 'want' skill:", error);
  alert(`Error: ${error.response?.data?.message || 'Could not add skill.'}`);
}
};

/**
 * Removes a "want" skill.
 * @param {object} skillToRemove - The need object to remove.
 */
const removeSkillWant = async (skillToRemove) => {
  try {
    // Make the API call to delete the need by its ID
    await apiClient.delete(`/skills/need/${skillToRemove.id}`);

    // Filter the need out of the local array
    user.value.skillsWant = user.value.skillsWant.filter(n => n.id !== skillToRemove.id);
  } catch (error) {
    console.error("Failed to remove 'want' skill:", error);
    alert('Error: Could not remove skill.');
  }
};

</script>