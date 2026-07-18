<template>
  <div class="container mx-auto animate-fade-in">
    <!-- Page Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900">Your Skill Matches</h1>
      <p class="text-gray-600 mt-2 max-w-2xl mx-auto">
        Here are students whose skills and needs align with yours. Accept a match to create a deal and start learning!
      </p>
    </div>

    <!-- Main Content Area -->
    <div>
      <!-- 1. Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="n in 3" :key="n" class="bg-white rounded-xl shadow-lg border h-80 animate-pulse">
          <div class="p-6">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div class="space-y-2">
                <div class="h-4 w-32 bg-gray-200 rounded"></div>
                <div class="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="h-16 bg-gray-200 rounded-lg mb-4"></div>
            <div class="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- 2. Content State (Matches Found) -->
      <div v-else-if="matches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <MatchCard
            v-for="match in matches"
            :key="match.partner_id"
            :match-id="match.partner_id"
            :user="{ name: match.partner_name, initials: getInitials(match.partner_name), rating: match.partner_rating }"
            :skills="{ theyOffer: match.partner_has_user_needs, youOffer: match.partner_needs_user_has }"
            @accept="handleAcceptMatch"
            @decline="handleDeclineMatch"
        />
      </div>

      <!-- 3. Empty State (No Matches Found) -->
      <div v-else class="text-center bg-white p-12 rounded-lg shadow-sm border">
        <div class="mx-auto bg-gray-100 h-16 w-16 flex items-center justify-center rounded-full mb-4">
          <SearchX :size="32" class="text-gray-500" />
        </div>
        <h2 class="text-xl font-semibold text-gray-800">No Matches Found Yet</h2>
        <p class="text-gray-500 mt-2 mb-6">
          To get skill matches, make sure you've added skills you <span class="font-semibold">have</span> and skills you <span class="font-semibold">want</span> to your profile.
        </p>
        <BaseButton @click="$router.push('/profile')">
          <template #icon><UserCircle :size="16" /></template>
          Go to My Profile
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Import the router for navigation
import apiClient from '@/services/api';
import { useDashboardStore } from '@/store/dashboard'; // Import the dashboard store
import MatchCard from '@/components/MatchCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import { SearchX, UserCircle } from 'lucide-vue-next';

// --- State and Store Initialization ---
const isLoading = ref(true);
const matches = ref([]);
const router = useRouter();
const dashboardStore = useDashboardStore(); // Initialize the dashboard store

// --- Data Fetching ---
const fetchMatches = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/skills/matches');
    matches.value = response.data;
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    matches.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMatches);

// --- Event Handlers ---

/**
 * Handles the 'accept' event from a MatchCard. This is the core workflow.
 * @param {string | number} partnerId - The ID of the user in the accepted match.
 */
const handleAcceptMatch = async (partnerId) => {
  console.log(`Accepting match and creating deal with user ID: ${partnerId}`);

  const acceptedMatch = matches.value.find(m => m.partner_id === partnerId);
  if (!acceptedMatch) {
    alert('Error: Could not find match details to create the deal.');
    return;
  }

  const skillExchangeDescription = `Exchange: ${acceptedMatch.partner_needs_user_has.join(', ')} for ${acceptedMatch.partner_has_user_needs.join(', ')}`;

  try {
    // Step 1: Create the match record in the database.
    const matchResponse = await apiClient.post('/skills/matches', {
      partnerId,
      skillExchange: skillExchangeDescription
    });
    const newMatch = matchResponse.data.match;

    // Step 2: Use the new match ID to create the deal.
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30); // Set deadline to 30 days from now
    const deadlineString = deadline.toISOString().split('T')[0];

    await apiClient.post('/deals', {
      match_id: newMatch.id,
      deadline: deadlineString,
    });

    // Step 3: Refresh the dashboard data in the background.
    // This ensures the stats (Active Deals, Pending Matches) are up-to-date.
    await dashboardStore.fetchDashboardData();

    // Step 4: Navigate the user to the Deals page to see their new deal.
    alert('Match accepted! You will now be taken to your Deals page.');
    router.push('/deals');

  } catch (error) {
    console.error('Failed to create match or deal:', error);
    alert(`Error: ${error.response?.data?.message || 'Could not create the deal.'}`);
  }
};

/**
 * Handles the 'decline' event from a MatchCard.
 * @param {string | number} partnerId - The ID of the user in the declined match.
 */
const handleDeclineMatch = (partnerId) => {
  console.log(`Declining match with user ID: ${partnerId}`);
  // Optimistic UI Update: Remove the card from the list immediately.
  matches.value = matches.value.filter(match => match.partner_id !== partnerId);
  // TODO: Make an API call to the backend to set the match status to 'declined'.
  // apiClient.post('/matches/decline', { partnerId });
};

// --- Helper Functions ---
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
</script>