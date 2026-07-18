<template>
  <div class="container mx-auto animate-fade-in">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Track Your Deals</h1>
      <p class="text-gray-600 mt-1">Manage all your ongoing and past skill exchanges here.</p>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-6" aria-label="Tabs">
        <button
            v-for="tab in tabs"
            :key="tab.status"
            @click="activeTab = tab.status"
            :class="[
            activeTab === tab.status
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div>
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div class="h-64 bg-gray-200 rounded-xl"></div>
        <div class="h-64 bg-gray-200 rounded-xl"></div>
      </div>

      <!-- Deals Grid (shows if loading is done AND there are deals in the current tab) -->
      <div v-else-if="filteredDeals.length > 0">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <DealCard
              v-for="deal in filteredDeals"
              :key="deal.id"
              :deal-id="deal.id"
              :partner-name="deal.partner_name"
              :skill-to-learn="deal.skillToLearn"
              :skill-to-teach="deal.skillToTeach"
              :deadline="deal.deadline"
              :status="deal.status"
              @complete-deal="handleCompleteDeal"
              @rate-deal="handleRateDeal"
              @cancel-deal="handleCancelDeal"
          />
        </div>
      </div>

      <!-- Empty State (shows if loading is done AND there are no deals for this tab) -->
      <div v-else class="text-center bg-white p-12 rounded-lg shadow-sm border">
        <div class="mx-auto bg-gray-100 h-16 w-16 flex items-center justify-center rounded-full mb-4">
          <PackageOpen :size="32" class="text-gray-500" />
        </div>
        <h2 class="text-xl font-semibold text-gray-800">No deals found</h2>
        <p class="text-gray-500 mt-2">There are no deals in the "{{ activeTab.replace('_', ' ') }}" category.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/api';
import { useDashboardStore } from '@/store/dashboard'; // Import the dashboard store
import DealCard from '@/components/DealCard.vue';
import { PackageOpen } from 'lucide-vue-next';

// --- State and Store Initialization ---
const isLoading = ref(true);
const deals = ref([]); // This will hold ALL deals (in_progress, completed, etc.)
const activeTab = ref('in_progress');
const dashboardStore = useDashboardStore(); // Initialize the dashboard store

const tabs = [
  { name: 'In Progress', status: 'in_progress' },
  { name: 'Completed', status: 'completed' },
  { name: 'Cancelled', status: 'cancelled' },
];

// --- Computed Property for Filtering ---
const filteredDeals = computed(() => {
  return deals.value.filter(deal => deal.status === activeTab.value);
});

// --- Data Fetching ---
const fetchDeals = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/deals');
    deals.value = response.data.map(deal => {
      // Process the raw API data to match the structure DealCard expects
      const parts = (deal.skill_exchange || '').replace('Exchange: ', '').split(' for ');
      return {
        ...deal,
        skillToTeach: parts[0] || 'Unknown Skill',
        skillToLearn: parts[1] || 'Unknown Skill',
      };
    });
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    deals.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchDeals);

// --- Event Handlers ---

// Helper function to update a deal's status in the local `deals` array
const updateDealStatusInUI = (dealId, newStatus) => {
  const deal = deals.value.find(d => d.id === dealId);
  if (deal) {
    deal.status = newStatus;
  }
};

const handleCompleteDeal = async (dealId) => {
  const originalStatus = 'in_progress';
  // Optimistic UI Update: Move the card to the 'Completed' tab instantly
  updateDealStatusInUI(dealId, 'completed');

  try {
    // Make API call to permanently update the status in the database
    await apiClient.patch(`/deals/${dealId}/status`, { status: 'completed' });
    // On success, refresh the dashboard data in the background
    await dashboardStore.fetchDashboardData();
  } catch (error) {
    console.error("Failed to complete deal:", error);
    // If API call fails, revert the change in the UI
    updateDealStatusInUI(dealId, originalStatus);
    alert('Error: Could not update the deal status.');
  }
};

const handleRateDeal = (dealId) => {
  alert(`Feature coming soon: Rate deal #${dealId}`);
  // Example API call: apiClient.post(`/deals/${dealId}/rate`, { rating: 5, feedback: "Great!" });
};

const handleCancelDeal = async (dealId) => {
  if (confirm('Are you sure you want to cancel this deal? This action cannot be undone.')) {
    const originalStatus = 'in_progress';
    // Optimistic UI Update
    updateDealStatusInUI(dealId, 'cancelled');

    try {
      await apiClient.patch(`/deals/${dealId}/status`, {status: 'cancelled'});
      // On success, refresh the dashboard data
      await dashboardStore.fetchDashboardData();
    } catch (error) {
      console.error("Failed to cancel deal:", error);
      // Revert UI change on error
      updateDealStatusInUI(dealId, originalStatus);
      alert('Error: Could not cancel the deal.');
    }
  }
};
</script>