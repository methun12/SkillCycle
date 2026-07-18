<template>
  <div class="container mx-auto animate-fade-in">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ welcomeMessage }}</h1>
      <p class="text-gray-600 mt-1">Here's a summary of your SkillCycle activity.</p>
    </div>

    <!-- Loading Skeleton (now driven by the store's isLoading flag) -->
    <div v-if="isLoading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse mb-8">
        <div class="h-28 bg-gray-200 rounded-lg"></div>
        <div class="h-28 bg-gray-200 rounded-lg"></div>
        <div class="h-28 bg-gray-200 rounded-lg"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          <div class="h-48 bg-gray-200 rounded-lg"></div>
          <div class="h-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="lg:col-span-1 h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Dashboard Content (driven by the store's data) -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="stats-card bg-blue-50 border-blue-200">
          <div class="p-2 bg-blue-100 rounded-full"><Handshake :size="24" class="text-blue-600" /></div>
          <div>
            <p class="text-3xl font-bold text-blue-900">{{ stats.activeDeals }}</p>
            <p class="text-sm font-medium text-blue-800">Active Deals</p>
          </div>
        </div>
        <div class="stats-card bg-yellow-50 border-yellow-200">
          <div class="p-2 bg-yellow-100 rounded-full"><Users :size="24" class="text-yellow-600" /></div>
          <div>
            <p class="text-3xl font-bold text-yellow-900">{{ stats.pendingMatches }}</p>
            <p class="text-sm font-medium text-yellow-800">Pending Matches</p>
          </div>
        </div>
        <div class="stats-card bg-green-50 border-green-200">
          <div class="p-2 bg-green-100 rounded-full"><CheckCircle2 :size="24" class="text-green-600" /></div>
          <div>
            <p class="text-3xl font-bold text-green-900">{{ stats.completedSkills }}</p>
            <p class="text-sm font-medium text-green-800">Deals Completed</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Active Deals -->
        <div class="lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Your Active Deals</h2>
            <router-link to="/deals" class="text-sm font-medium text-blue-600 hover:underline">
              View All
            </router-link>
          </div>
          <div v-if="activeDeals.length > 0" class="space-y-4">
            <DealCard
                v-for="deal in activeDeals.slice(0, 3)"
                :key="deal.id"
                :deal-id="deal.id"
                :partner-name="deal.partner_name"
                :skill-to-learn="deal.skillToLearn"
                :skill-to-teach="deal.skillToTeach"
                :deadline="deal.deadline"
                :status="deal.status"
            />
          </div>
          <div v-else class="text-center bg-white p-10 rounded-lg shadow-sm border">
            <h3 class="text-lg font-semibold">No active deals right now.</h3>
            <p class="text-gray-500 mt-1">Accept a match to start a new deal!</p>
          </div>
        </div>

        <!-- Right Column: Trending Skills & CTA -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">🔥 Trending Skills</h3>
            <ul v-if="trendingSkills.length > 0" class="space-y-3">
              <li v-for="skill in trendingSkills" :key="skill.skill_name" class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700">{{ skill.skill_name }}</span>
                <span class="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{{ skill.request_count }} requests</span>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-500">No trending skills data available yet.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div class="mx-auto bg-blue-100 h-12 w-12 flex items-center justify-center rounded-full">
              <Lightbulb :size="24" class="text-blue-600"/>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mt-4">Find Your Next Skill</h3>
            <p class="text-sm text-gray-500 mt-1 mb-4">Explore new opportunities and find a partner to learn from.</p>
            <BaseButton @click="$router.push('/matches')" fullWidth>
              <template #icon><Search :size="16"/></template>
              Find Matches
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useDashboardStore } from '@/store/dashboard'; // Import the new dashboard store
import { storeToRefs } from 'pinia'; // Pinia utility to keep state reactive
import DealCard from '@/components/DealCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Handshake, Users, CheckCircle2, Lightbulb, Search } from 'lucide-vue-next';

// --- Store Initialization ---
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

// --- State Management ---
// Use `storeToRefs` to create reactive references to the store's state.
// This is the recommended way to use store state in a component's template.
// If you did `const { stats } = dashboardStore`, it would NOT be reactive.
const { stats, activeDeals, trendingSkills, isLoading } = storeToRefs(dashboardStore);

// --- Computed Properties ---
const welcomeMessage = computed(() => `Welcome back, ${authStore.userName}!`);

// --- Data Fetching ---
// The component's only responsibility is to trigger the data fetch when it loads.
// The store handles the actual API calls and state updates.
onMounted(() => {
  dashboardStore.fetchDashboardData();
});
</script>

<style scoped>
.stats-card {
  @apply flex items-center gap-4 p-5 border rounded-xl;
}
</style>