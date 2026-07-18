// backend/src/routes/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all dashboard routes
router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

module.exports = router;