const pool = require('../db/connection');

/**
 * Model for handling all database queries related to the dashboard statistics.
 */
const dashboardModel = {

    /**
     * Counts the number of deals for a user that are currently 'in_progress'.
     * @param {number} userId - The ID of the logged-in user.
     * @returns {Promise<number>} The total count of active deals.
     */
    async countActiveDeals(userId) {
        const sql = `
      SELECT COUNT(d.id) as count 
      FROM deals d
      JOIN matches m ON d.match_id = m.id
      WHERE (m.user1_id = ? OR m.user2_id = ?) AND d.status = 'in_progress'
    `;
        const [rows] = await pool.execute(sql, [userId, userId]);
        // The result is an array with one object, e.g., [{ count: 2 }]. We extract the count value.
        return rows[0].count;
    },

    /**
     * **CORRECTED LOGIC**
     * Counts the number of matches for a user that are still 'pending' AND have not yet become a deal.
     * This represents true, actionable match recommendations.
     * @param {number} userId - The ID of the logged-in user.
     * @returns {Promise<number>} The total count of pending matches.
     */
    async countPendingMatches(userId) {
        const sql = `
      SELECT COUNT(m.id) as count 
      FROM matches m
      -- Use a LEFT JOIN to find matches that have NO corresponding deal record.
      LEFT JOIN deals d ON m.id = d.match_id
      WHERE 
        (m.user1_id = ? OR m.user2_id = ?) 
        AND m.status = 'pending' 
        AND d.id IS NULL
    `;
        const [rows] = await pool.execute(sql, [userId, userId]);
        return rows[0].count;
    },

    /**
     * Counts the number of deals for a user that have been 'completed'.
     * This is used for the "Deals Completed" stat on the dashboard.
     * @param {number} userId - The ID of the logged-in user.
     * @returns {Promise<number>} The total count of completed deals.
     */
    async countCompletedDeals(userId) {
        const sql = `
      SELECT COUNT(d.id) as count 
      FROM deals d
      JOIN matches m ON d.match_id = m.id
      WHERE (m.user1_id = ? OR m.user2_id = ?) AND d.status = 'completed'
    `;
        const [rows] = await pool.execute(sql, [userId, userId]);
        return rows[0].count;
    }
};

module.exports = dashboardModel;