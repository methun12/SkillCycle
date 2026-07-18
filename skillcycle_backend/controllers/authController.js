const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Controller object for handling all authentication-related logic.
 */
const authController = {
    /**
     * Handles the registration of a new user.
     * It validates input, hashes the password, creates the user in the database,
     * and returns a JWT for immediate login.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    async register(req, res) {
        try {
            // 1. Destructure name, email, and password from the request body.
            const { name, email, password } = req.body;

            // 2. Perform basic input validation.
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Name, email, and password are required.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
            }

            // 3. Hash the password for security before storing it.
            const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds of complexity
            const hashedPassword = await bcrypt.hash(password, salt);

            // 4. Call the user model to create the new user in the database.
            const userId = await userModel.create(name, email, hashedPassword);

            // 5. Prepare the user object to be sent back in the response (without the password).
            const newUser = { id: userId, name, email };

            // 6. Create a JSON Web Token (JWT) to log the user in automatically after registration.
            const token = jwt.sign(
                { id: newUser.id },      // Payload: contains the user's unique ID
                process.env.JWT_SECRET, // Secret key from the .env file
                { expiresIn: process.env.JWT_EXPIRES_IN } // Expiration time from the .env file
            );

            // 7. Send a successful response with a 201 Created status code.
            res.status(201).json({
                message: 'User registered successfully.',
                token,
                user: newUser
            });

        } catch (error) {
            // 8. Handle errors, especially for duplicate emails.
            if (error.message.includes('already exists')) {
                // If the model threw our custom duplicate error, send a 409 Conflict status.
                return res.status(409).json({ message: error.message });
            }

            // For all other errors, log it and send a generic 500 Internal Server Error.
            console.error('Registration Error:', error);
            res.status(500).json({ message: 'Server error during registration.' });
        }
    },

    /**
     * Handles the login for an existing user.
     * It finds the user, compares passwords, and if successful, returns a new JWT.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    async login(req, res) {
        try {
            // 1. Destructure email and password from the request body.
            const { email, password } = req.body;

            // 2. Basic input validation.
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required.' });
            }

            // 3. Find the user in the database by their email.
            const user = await userModel.findByEmail(email);

            // 4. If no user is found, send a 401 Unauthorized response.
            // Use a generic message for security to prevent email enumeration attacks.
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // 5. Compare the submitted password with the hashed password stored in the database.
            const isMatch = await bcrypt.compare(password, user.password);

            // 6. If passwords do not match, send a 401 Unauthorized response.
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // 7. If credentials are correct, create and sign a new JWT.
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // 8. Prepare the user object for the response (omitting the sensitive password).
            const userResponse = { id: user.id, name: user.name, email: user.email, rating: user.rating };

            // 9. Send a successful response with the token and user data.
            res.status(200).json({
                message: 'Login successful.',
                token,
                user: userResponse
            });

        } catch (error) {
            // 10. Handle any unexpected server errors.
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    }
};

module.exports = authController;