// 1. Import the Express library to create the router.
const express = require('express');

// 2. Create a new router instance for skill-related routes.
const router = express.Router();

// 3. Import the skill controller which contains the core business logic.
const skillController = require('../controllers/skillController');

// 4. Import the authentication middleware to protect all routes in this file.
const authMiddleware = require('../middleware/authMiddleware');


// --- Middleware ---

// Apply the authentication middleware to ALL routes defined below.
// This ensures that every request to a `/api/skills` endpoint requires a valid JWT.
router.use(authMiddleware);


// =================================================================
// Routes for Managing "Have" Skills
// =================================================================

/**
 * @route   POST /api/skills/have
 * @desc    Add a skill the user has
 * @access  Private (Authenticated users only)
 */
router.post('/have', skillController.addSkillHave);

/**
 * @route   DELETE /api/skills/have/:skillId
 * @desc    Remove a skill the user has
 * @access  Private
 */
router.delete('/have/:skillId', skillController.removeSkillHave);


// =================================================================
// Routes for Managing "Need" Skills
// =================================================================

/**
 * @route   POST /api/skills/need
 * @desc    Add a skill the user needs
 * @access  Private
 */
router.post('/need', skillController.addSkillNeed);

/**
 * @route   DELETE /api/skills/need/:needId
 * @desc    Remove a skill the user needs
 * @access  Private
 */
router.delete('/need/:needId', skillController.removeSkillNeed);


// =================================================================
// Routes for Fetching User Skills, Matches, and Trends
// =================================================================

/**
 * @route   GET /api/skills/my-skills
 * @desc    Get all skills (haves and needs) for the logged-in user
 * @access  Private
 */
router.get('/my-skills', skillController.getMySkills);


/**
 * @route   GET /api/skills/matches
 * @desc    Find skill exchange match recommendations for the logged-in user
 * @access  Private
 */
router.get('/matches', skillController.findMatches);

/**
 * @route   POST /api/skills/matches
 * @desc    Create a new match record when a user accepts a recommendation
 * @access  Private
 */
router.post('/matches', skillController.createMatch);

/**
 * @route   GET /api/skills/trending
 * @desc    Get the top 5 most requested skills for the dashboard
 * @access  Private
 */
router.get('/trending', skillController.getTrendingSkills);


// 5. Export the router so it can be used in the main app.js file.
module.exports = router;