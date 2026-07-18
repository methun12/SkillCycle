import { defineStore } from 'pinia';
import apiClient from '@/services/api';

/**
 * Pinia store for managing the state of the Dashboard page.
 * This centralizes the data and logic, allowing any component to
 * access or refresh the dashboard's data.
 */
export const useDashboardStore = defineStore('dashboard', {
    /**
     * --- STATE ---
     * The single source of truth for all data displayed on the dashboard.
     */
    state: () => ({
        // Holds the statistics like { activeDeals: 2, pendingMatches: 4, ... }
        stats: {
            activeDeals: 0,
            pendingMatches: 0,
            completedSkills: 0,
        },
        // Holds the list of the user's deals that are 'in_progress'
        activeDeals: [],
        // Holds the list of top 5 most requested skills on the platform
        trendingSkills: [],
        // A flag to show a loading state on the UI while data is being fetched
        isLoading: true,
    }),

    /**
     * --- ACTIONS ---
     * Methods used to change the state, typically by fetching data from the API.
     */
    actions: {
        /**
         * Fetches all necessary data for the dashboard from the backend in parallel
         * and updates the store's state. This action can be called from any component
         * to trigger a full refresh of the dashboard's data.
         */
        async fetchDashboardData() {
            // Set loading to true to show spinners on the dashboard page
            this.isLoading = true;
            try {
                // Use Promise.all to make all API calls concurrently for faster performance
                const [statsResponse, activeDealsResponse, trendingSkillsResponse] = await Promise.all([
                    apiClient.get('/dashboard/stats'),
                    apiClient.get('/deals?status=in_progress'),
                    apiClient.get('/skills/trending')
                ]);

                // Update the state with the data from the API responses
                this.stats = statsResponse.data;
                this.trendingSkills = trendingSkillsResponse.data;

                // Process the active deals data to match the structure that the
                // DealCard.vue component expects.
                this.activeDeals = activeDealsResponse.data.map(deal => {
                    const parts = deal.skill_exchange.replace('Exchange: ', '').split(' for ');
                    return {
                        ...deal,
                        skillToTeach: parts[0] || 'Unknown Skill',
                        skillToLearn: parts[1] || 'Unknown Skill',
                    };
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data for the store:", error);
                // In case of an error, we can reset the state to avoid showing stale data
                this.stats = { activeDeals: 0, pendingMatches: 0, completedSkills: 0 };
                this.activeDeals = [];
                this.trendingSkills = [];
            } finally {
                // This will run whether the API calls succeeded or failed,
                // ensuring the loading state is always turned off.
                this.isLoading = false;
            }
        }
    }
});