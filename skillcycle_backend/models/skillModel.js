const pool = require('../db/connection');

/**
 * Model for handling all database operations related to skills, needs, and matches.
 */
const skillModel = {

    /**
     * Adds a skill that a user has to the database.
     * @param {number} userId - The ID of the user.
     * @param {string} skillName - The name of the skill.
     * @param {string} level - The user's proficiency level.
     * @returns {object} The newly created skill object.
     */
    async addHave(userId, skillName, level) {
        const sql = `INSERT INTO skills (user_id, skill_name, level) VALUES (?, ?, ?)`;
        const [result] = await pool.execute(sql, [userId, skillName, level]);
        return { id: result.insertId, user_id: userId, skill_name: skillName, level };
    },

    /**
     * Adds a skill that a user needs to the database.
     * @param {number} userId - The ID of the user.
     * @param {string} skillName - The name of the skill needed.
     * @param {string} urgencyLevel - The urgency of the need.
     * @returns {object} The newly created need object.
     */
    async addNeed(userId, skillName, urgencyLevel) {
        const sql = `INSERT INTO needs (user_id, skill_name, urgency_level) VALUES (?, ?, ?)`;
        const [result] = await pool.execute(sql, [userId, skillName, urgencyLevel]);
        return { id: result.insertId, user_id: userId, skill_name: skillName, urgency_level: urgencyLevel };
    },

    /**
     * Finds all skills that a specific user has.
     * @param {number} userId - The ID of the user.
     * @returns {Array<object>} A list of skills the user has.
     */
    async findHavesByUserId(userId) {
        const sql = `SELECT id, skill_name, level FROM skills WHERE user_id = ? ORDER BY created_at DESC`;
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    },

    /**
     * Finds all skills that a specific user needs.
     * @param {number} userId - The ID of the user.
     * @returns {Array<object>} A list of skills the user needs.
     */
    async findNeedsByUserId(userId) {
        const sql = `SELECT id, skill_name, urgency_level FROM needs WHERE user_id = ? ORDER BY created_at DESC`;
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    },

    /**
     * Deletes a skill from a user's "have" list.
     * @param {number} skillId - The ID of the skill to delete.
     * @param {number} userId - The ID of the user requesting the deletion for ownership verification.
     * @returns {number} The number of affected rows.
     */
    async removeHave(skillId, userId) {
        const sql = `DELETE FROM skills WHERE id = ? AND user_id = ?`;
        const [result] = await pool.execute(sql, [skillId, userId]);
        return result.affectedRows;
    },

    /**
     * Deletes a skill from a user's "need" list.
     * @param {number} needId - The ID of the need to delete.
     * @param {number} userId - The ID of the user requesting the deletion for ownership verification.
     * @returns {number} The number of affected rows.
     */
    async removeNeed(needId, userId) {
        const sql = `DELETE FROM needs WHERE id = ? AND user_id = ?`;
        const [result] = await pool.execute(sql, [needId, userId]);
        return result.affectedRows;
    },

    /**
     * **CORRECTED VERSION**
     * Creates a new record in the 'matches' table.
     * Fixes the "Unknown column 'user_id'" error by using the correct column name 'user1_id'.
     * @param {number} user1Id - The ID of the user initiating the match (the logged-in user).
     * @param {number} user2Id - The ID of the partner being matched with.
     * @param {string} skillExchange - A description of the skill swap.
     * @returns {object} The newly created match object.
     */
    async createMatch(user1Id, user2Id, skillExchange) {
        const description = skillExchange || 'A new skill exchange has been proposed.';
        const sql = `
      INSERT INTO matches (user1_id, user2_id, skill_exchange, status)
      VALUES (?, ?, ?, 'pending')
    `;
        const [result] = await pool.execute(sql, [user1Id, user2Id, description]);

        return {
            id: result.insertId,
            user1_id: user1Id,
            user2_id: user2Id,
            skill_exchange: description,
            status: 'pending'
        };
    },

    /**
     * **FINAL, SIMPLIFIED, AND MOST RELIABLE VERSION**
     * Finds potential skill exchange matches for a given user.
     * This query is structured to be less complex and more direct.
     * @param {number} userId - The ID of the user to find matches for.
     * @returns {Array<object>} A list of matched users and their corresponding skills.
     */
    async findMatchesForUser(userId) {
        const sql = `
        SELECT
            p.id as partner_id,
            p.name as partner_name,
            p.rating as partner_rating,
            GROUP_CONCAT(DISTINCT p_skills.skill_name) AS partner_has_user_needs,
            GROUP_CONCAT(DISTINCT my_skills.skill_name) AS partner_needs_user_has
        FROM skills AS my_skills
        JOIN needs AS partner_needs ON LOWER(TRIM(my_skills.skill_name)) = LOWER(TRIM(partner_needs.skill_name))
        JOIN users AS p ON p.id = partner_needs.user_id
        JOIN needs AS my_needs ON my_skills.user_id = my_skills.user_id
        JOIN skills AS p_skills ON LOWER(TRIM(my_needs.skill_name)) = LOWER(TRIM(p_skills.skill_name)) AND p_skills.user_id = p.id
        WHERE
            my_skills.user_id = ?
            AND p.id != ?
            AND NOT EXISTS (
                SELECT 1 FROM matches m
                WHERE 
                    ((m.user1_id = ? AND m.user2_id = p.id) OR (m.user1_id = p.id AND m.user2_id = ?))
                    AND m.status != 'declined'
            )
        GROUP BY p.id, p.name, p.rating
        ORDER BY p.rating DESC;
    `;

        const [rows] = await pool.execute(sql, [userId, userId, userId, userId]);

        return rows.map(match => ({
            ...match,
            partner_has_user_needs: match.partner_has_user_needs ? match.partner_has_user_needs.split(',') : [],
            partner_needs_user_has: match.partner_needs_user_has ? match.partner_needs_user_has.split(',') : [],
        }));
    },

    /**
     * Gets the top 5 most frequently requested skills from the 'needs' table.
     * @returns {Promise<Array<object>>} A list of trending skills.
     */
    async getTrendingSkills() {
        const sql = `SELECT skill_name, request_count FROM top_skills_view LIMIT 5`;
        const [rows] = await pool.execute(sql);
        return rows;
    },
};

module.exports = skillModel;