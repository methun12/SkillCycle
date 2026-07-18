`/src/models/userModel.js`
// Import the configured database connection pool.
const pool = require('../db/connection');

/**
 * Model for handling all database operations related to the users table.
 */
const userModel = {

    /**
     * Creates a new user in the database.
     * @param {string} name - The user's full name.
     * @param {string} email - The user's email address.
     * @param {string} hashedPassword - The user's password, already hashed by bcrypt.
     * @returns {number} The ID of the newly created user.
     * @throws {Error} Throws a custom error if the email already exists.
     */
    async create(name, email, hashedPassword) {
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        try {
            // Execute the SQL query using the connection pool.
            // The `execute` method helps prevent SQL injection attacks.
            const [result] = await pool.execute(sql, [name, email, hashedPassword]);

            // Return the ID of the newly inserted row.
            return result.insertId;

        } catch (error) {
            // Check for the specific MySQL error code for a duplicate entry.
            // 'ER_DUP_ENTRY' is the standard code for a unique constraint violation.
            if (error.code === 'ER_DUP_ENTRY') {
                // Throw a new, more user-friendly error that the controller can catch and handle.
                throw new Error('An account with this email already exists.');
            }
            // If the error is something else (e.g., a connection issue), re-throw it.
            throw error;
        }
    },

    /**
     * Finds a single user by their email address.
     * This is primarily used during the login process.
     * @param {string} email - The email of the user to find.
     * @returns {object|undefined} The user object if found, otherwise undefined.
     */
    async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        // The query returns an array of rows and a fields object. We only need the rows.
        const [rows] = await pool.execute(sql, [email]);

        // Since email is unique, this will return at most one row.
        // Return the first element of the array, which is the user object, or undefined if the array is empty.
        return rows[0];
    },

    /**
     * Finds a single user by their ID.
     * This can be useful for fetching a user's profile or after decoding a JWT.
     * @param {number} id - The ID of the user to find.
     * @returns {object|undefined} The user object if found, otherwise undefined.
     */
    async findById(id) {
        const sql = `SELECT id, name, email, rating, created_at FROM users WHERE id = ?`;
        // We explicitly list the columns to avoid selecting the hashed password.
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    },

    /**
     * Updates the average rating for a user.
     * This method would typically be called by a database trigger, but it's
     * included here to show how it would be done programmatically.
     * @param {number} userId - The ID of the user whose rating is to be updated.
     */
    async updateAverageRating(userId) {
        // This query calculates the average of all ratings where the user was the "ratee"
        // and updates the user's record.
        const sql = `
      UPDATE users u
      SET u.rating = (
        SELECT AVG(r.rating)
        FROM ratings r
        WHERE r.ratee_id = ?
      )
      WHERE u.id = ?
    `;
        await pool.execute(sql, [userId, userId]);
        console.log(`Updated average rating for user ID: ${userId}`);
    },

};

module.exports = userModel;