const dealModel = require('../models/dealModel');

/**
 * Controller for handling all deal and rating related logic.
 */
const dealController = {

    /**
     * Creates a new deal from an existing match.
     * Expects match_id and deadline in the request body.
     * The user creating the deal is identified from the authenticated JWT.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createDeal(req, res) {
        try {
            // 1. Extract match_id and deadline from the request body.
            const { match_id, deadline } = req.body;

            // 2. Get the current user's ID from the request object (added by authMiddleware).
            const creatorId = req.user.id;

            // 3. Basic validation.
            if (!match_id || !deadline) {
                return res.status(400).json({ message: 'Match ID and deadline are required.' });
            }

            // 4. Call the model to create the deal.
            // The model should verify that the creatorId is part of the match before creating the deal.
            // The model will also ideally use a transaction to ensure data integrity.
            const newDeal = await dealModel.create(match_id, deadline, creatorId);

            // 5. Send a successful response.
            res.status(201).json({ message: 'Deal created successfully.', deal: newDeal });

        } catch (error) {
            // 6. Handle errors.
            console.error('Create Deal Error:', error);
            // Check for a custom error message from the model (e.g., if user is not part of the match)
            if (error.message.includes('not authorized') || error.message.includes('not found')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error while creating the deal.' });
        }
    },

    /**
     * Fetches all deals associated with the currently logged-in user.
     * Can optionally filter by status (in_progress, completed, cancelled).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getDealsForUser(req, res) {
        try {
            // 1. Get the current user's ID from the authenticated request.
            const userId = req.user.id;

            // 2. Get the optional 'status' filter from the query parameters.
            const { status } = req.query;

            // 3. Call the model to find the deals for this user.
            const deals = await dealModel.findByUserId(userId, status);

            // 4. Send the list of deals as a response.
            res.status(200).json(deals);

        } catch (error) {
            // 5. Handle errors.
            console.error('Get Deals Error:', error);
            res.status(500).json({ message: 'Server error while fetching deals.' });
        }
    },

    /**
     * Updates the status of a specific deal (e.g., to 'completed' or 'cancelled').
     * Ensures that only a participant of the deal can update its status.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateDealStatus(req, res) {
        try {
            // 1. Get the deal ID from the URL parameters.
            const { dealId } = req.params;

            // 2. Get the new status from the request body.
            const { status } = req.body;

            // 3. Get the current user's ID from the authenticated request.
            const userId = req.user.id;

            // 4. Basic validation.
            const allowedStatus = ['completed', 'cancelled'];
            if (!status || !allowedStatus.includes(status)) {
                return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}` });
            }

            // 5. Call the model to update the deal status.
            // The model must verify that the userId is a participant in the deal before updating.
            const updatedDeal = await dealModel.updateStatus(dealId, status, userId);

            // 6. Send a successful response.
            res.status(200).json({ message: 'Deal status updated successfully.', deal: updatedDeal });

        } catch (error) {
            // 7. Handle errors.
            console.error('Update Deal Status Error:', error);
            if (error.message.includes('not authorized') || error.message.includes('not found')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error while updating deal status.' });
        }
    },

    /**
     * Adds a rating and feedback for a completed deal.
     * A database trigger is expected to handle the recalculation of the user's average rating.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async rateDeal(req, res) {
        try {
            // 1. Get the deal ID from the URL parameters.
            const { dealId } = req.params;

            // 2. Get the rating and feedback from the request body.
            const { rating, feedback } = req.body;

            // 3. The user giving the rating (the rater).
            const raterId = req.user.id;

            // 4. Basic validation.
            if (rating === undefined || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating is required and must be between 1 and 5.' });
            }

            // 5. Call the model to create the rating.
            // The model will contain the logic to:
            //  a) Verify the deal exists and is 'completed'.
            //  b) Verify the rater was a participant in the deal.
            //  c) Prevent a user from rating the same deal twice.
            //  d) Identify the other participant (the ratee) to associate the rating with them.
            await dealModel.createRating(dealId, raterId, rating, feedback);

            // 6. Send a successful response. The database trigger will have updated the user's average rating.
            res.status(201).json({ message: 'Thank you for your feedback! Rating submitted successfully.' });

        } catch (error) {
            // 7. Handle errors.
            console.error('Rate Deal Error:', error);
            if (error.message.includes('not authorized') || error.message.includes('not completed') || error.message.includes('already rated')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error while submitting rating.' });
        }
    }
};

module.exports = dealController;