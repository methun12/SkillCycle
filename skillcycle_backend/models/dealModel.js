const pool = require('../db/connection');

/**
 * Model for handling all database operations related to deals and ratings.
 */
const dealModel = {

    /**
     * **TRANSACTIONAL CREATE**
     * Creates a new deal and atomically updates the associated match's status to 'accepted'.
     * Using a transaction guarantees that both operations succeed or both fail together.
     * @param {number} matchId - The ID of the match to create the deal from.
     * @param {string} deadline - The deadline for the deal (e.g., 'YYYY-MM-DD').
     * @param {number} creatorId - The ID of the user creating the deal (for validation).
     * @returns {object} The newly created deal object.
     */
    async create(matchId, deadline, creatorId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Step 1: Verify the match exists and the creator is part of it.
            const [matches] = await connection.execute(
                `SELECT user1_id, user2_id FROM matches WHERE id = ?`,
                [matchId]
            );
            if (matches.length === 0) {
                throw new Error('Match not found.');
            }
            const match = matches[0];
            if (match.user1_id !== creatorId && match.user2_id !== creatorId) {
                throw new Error('User is not authorized to create a deal for this match.');
            }

            // Step 2: Insert the new deal into the deals table.
            const [result] = await connection.execute(
                `INSERT INTO deals (match_id, deadline, status, created_at) VALUES (?, ?, 'in_progress', NOW())`,
                [matchId, deadline]
            );
            const newDealId = result.insertId;

            // Step 3: CRITICAL - Update the original match's status to 'accepted'.
            // This is essential for the "Pending Matches" count on the dashboard to be accurate.
            await connection.execute(
                `UPDATE matches SET status = 'accepted' WHERE id = ?`,
                [matchId]
            );

            // If all operations were successful, commit the transaction.
            await connection.commit();

            // Step 4: Fetch and return the full details of the newly created deal.
            const [newDealRows] = await this.findById(newDealId);
            return newDealRows[0];

        } catch (error) {
            // If any error occurs, roll back all changes made during the transaction.
            await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A deal for this match has already been created.');
            }
            throw error; // Re-throw the error for the controller to handle.
        } finally {
            // CRITICAL: Always release the connection back to the pool.
            connection.release();
        }
    },

    /**
     * Finds all deals associated with a given user ID.
     * @param {number} userId - The ID of the user.
     * @param {string} [status] - Optional status to filter by.
     * @returns {Array<object>} A list of deal objects.
     */
    async findByUserId(userId, status) {
        let sql = `
      SELECT
        d.id,
        d.status,
        d.deadline,
        m.skill_exchange,
        p.id AS partner_id,
        p.name AS partner_name
      FROM deals d
      JOIN matches m ON d.match_id = m.id
      JOIN users p ON (p.id = m.user1_id OR p.id = m.user2_id) AND p.id != ?
      WHERE (m.user1_id = ? OR m.user2_id = ?)
    `;

        const params = [userId, userId, userId];

        if (status) {
            sql += ` AND d.status = ?`;
            params.push(status);
        }

        // Sort by the deal's deadline, which is useful for the user.
        sql += ` ORDER BY d.deadline ASC`;

        const [rows] = await pool.execute(sql, params);
        return rows;
    },

    /**
     * Updates the status of a deal.
     * @param {number} dealId - The ID of the deal to update.
     * @param {string} status - The new status ('completed' or 'cancelled').
     * @param {number} userId - The ID of the user requesting the update for validation.
     * @returns {object} The updated deal object.
     */
    async updateStatus(dealId, status, userId) {
        const [deals] = await pool.execute(`
      SELECT d.id FROM deals d
      JOIN matches m ON d.match_id = m.id
      WHERE d.id = ? AND (m.user1_id = ? OR m.user2_id = ?)`,
            [dealId, userId, userId]
        );

        if (deals.length === 0) {
            throw new Error('Deal not found or you are not authorized to update it.');
        }

        await pool.execute(`UPDATE deals SET status = ? WHERE id = ?`, [status, dealId]);
        const [updatedDealRows] = await this.findById(dealId);
        return updatedDealRows[0];
    },

    /**
     * Creates a new rating for a completed deal.
     * @param {number} dealId - The ID of the deal being rated.
     * @param {number} raterId - The ID of the user giving the rating.
     * @param {number} rating - The rating value (1-5).
     * @param {string} [feedback] - Optional feedback text.
     */
    async createRating(dealId, raterId, rating, feedback) {
        const [deals] = await pool.execute(`
      SELECT d.status, m.user1_id, m.user2_id 
      FROM deals d
      JOIN matches m ON d.match_id = m.id
      WHERE d.id = ?`,
            [dealId]
        );

        if (deals.length === 0) throw new Error('Deal not found.');

        const deal = deals[0];
        if (deal.status !== 'completed') throw new Error('You can only rate completed deals.');
        if (deal.user1_id !== raterId && deal.user2_id !== raterId) throw new Error('You are not authorized to rate this deal.');

        const rateeId = deal.user1_id === raterId ? deal.user2_id : deal.user1_id;

        try {
            await pool.execute(
                `INSERT INTO ratings (deal_id, rater_id, ratee_id, rating, feedback) VALUES (?, ?, ?, ?, ?)`,
                [dealId, raterId, rateeId, rating, feedback]
            );
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('You have already rated this deal.');
            }
            throw error;
        }
    },

    /**
     * Helper function to find a single deal by its ID.
     * @param {number} dealId - The ID of the deal.
     * @returns {Promise<Array<object>>} The deal object in an array.
     */
    async findById(dealId) {
        const sql = `
        SELECT d.id, d.status, d.deadline, m.skill_exchange
        FROM deals d
        JOIN matches m on d.match_id = m.id
        WHERE d.id = ?
    `;
        return await pool.execute(sql, [dealId]);
    }
};

module.exports = dealModel;