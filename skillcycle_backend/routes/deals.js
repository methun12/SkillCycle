// 1. Import the Express library to create the router.
const express = require('express');

// 2. Create a new router instance for deal-related routes.
const router = express.Router();

// 3. Import the deal controller which contains the business logic.
const dealController = require('../controllers/dealController');

// 4. Import the authentication middleware to protect the routes.
const authMiddleware = require('../middleware/authMiddleware');


// --- Route Definitions ---

// Apply the authentication middleware to ALL routes defined in this file.
// Any request to a /api/deals endpoint will first have to pass through authMiddleware.
// If the user's token is not valid, the request will be blocked before it ever
// reaches the controller function.
router.use(authMiddleware);


/**
 * @route   POST /api/deals
 * @desc    Create a new deal from a match
 * @access  Private (Authenticated users only)
 */
router.post('/', dealController.createDeal);


/**
 * @route   GET /api/deals
 * @desc    Get all deals for the logged-in user (can be filtered by status query param)
 * @access  Private
 * @example GET /api/deals?status=in_progress
 */
router.get('/', dealController.getDealsForUser);


/**
 * @route   PATCH /api/deals/:dealId/status
 * @desc    Update the status of a deal (e.g., to 'completed' or 'cancelled')
 * @access  Private
 */
router.patch('/:dealId/status', dealController.updateDealStatus);


/**
 * @route   POST /api/deals/:dealId/rate
 * @desc    Add a rating to a completed deal
 * @access  Private
 */
router.post('/:dealId/rate', dealController.rateDeal);


// 5. Export the router so it can be used in the main app.js file.
module.exports = router;