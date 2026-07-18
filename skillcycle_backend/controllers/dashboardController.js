const dashboardModel = require('../models/dashboardModel');

/**
 * Controller for handling all logic related to fetching data for the main dashboard.
 */
const dashboardController = {

    /**
     * Fetches a summary of statistics for the currently logged-in user.
     * This includes the count of active deals, pending matches, and completed deals.
     * It runs all database queries in parallel for maximum efficiency.
     *
     * @param {object} req - The Express request object, containing `req.user` from authMiddleware.
     * @param {object} res - The Express response object.
     */
    async getStats(req, res) {
        try {
            // 1. Get the current user's ID from the request object.
            // This is securely added by the authMiddleware after verifying the JWT.
            const userId = req.user.id;

            // 2. Use Promise.all to execute all counting queries from the model concurrently.
            // This is much faster than awaiting each query individually.
            const [
                activeDealsCount,
                pendingMatchesCount,
                completedDealsCount
            ] = await Promise.all([
                dashboardModel.countActiveDeals(userId),
                dashboardModel.countPendingMatches(userId),
                dashboardModel.countCompletedDeals(userId) // Renamed for clarity
            ]);

            // 3. Assemble the final JSON response object.
            const stats = {
                activeDeals: activeDealsCount,
                pendingMatches: pendingMatchesCount,
                completedSkills: completedDealsCount // Frontend expects this key name
            };

            // 4. Send a successful 200 OK response with the stats data.
            res.status(200).json(stats);

        } catch (error) {
            // 5. If any of the database queries fail, handle the error.
            console.error('Get Dashboard Stats Error:', error);
            res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
        }
    }
};

module.exports = dashboardController;