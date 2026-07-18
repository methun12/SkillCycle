// 1. Import the Express library to create and manage the router.
const express = require('express');

// 2. Create a new router instance. This object will handle the auth-specific routes.
const router = express.Router();

// 3. Import the authentication controller which contains the core logic for each route.
const authController = require('../controllers/authController');


// --- Route Definitions ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * This route defines the endpoint for creating a new user account.
 * - It listens for POST requests to '/register'.
 * - When a request is received, it passes the request (req) and response (res) objects
 *   to the `register` function within the `authController`.
 */
router.post('/register', authController.register);


/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and get a token
 * @access  Public
 *
 * This route defines the endpoint for logging in an existing user.
 * - It listens for POST requests to '/login'.
 * - It calls the `login` function from the `authController` to handle the
 *   authentication logic.
 */
router.post('/login', authController.login);


// 4. Export the router.
// This allows the main `app.js` file to import and use these routes.
module.exports = router;