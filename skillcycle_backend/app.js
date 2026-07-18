/**
 * ==================================
 * Main Server File for SkillCycle API
 * ==================================
 * This file bootstraps the Express application.
 */

// 1. Load Environment Variables
// It's crucial to load this first so that all other files have access to process.env
require('dotenv').config();

// 2. Import Dependencies
const express = require('express');
const cors = require('cors');

// 3. Import Route Modules
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const dealRoutes = require('./routes/deals');
const dashboardRoutes = require('./routes/dashboard');

// 4. Initialize the Express Application
const app = express();

// 5. Configure Middleware
// -----------------------

// Enable Cross-Origin Resource Sharing (CORS)
// This is essential for allowing your Vue.js frontend (running on a different port)
// to communicate with this backend.
app.use(cors());

// Enable the Express JSON middleware
// This allows the server to automatically parse incoming request bodies as JSON.
// It makes `req.body` available in your controllers.
app.use(express.json());


// 6. Define API Routes
// --------------------

// Mount the imported route modules on specific base paths.
// This keeps the API organized and modular.

// All authentication routes will be prefixed with /api/auth
// e.g., POST /api/auth/register
app.use('/api/auth', authRoutes);

// All skill, need, and match routes will be prefixed with /api/skills
// e.g., GET /api/skills/matches
app.use('/api/skills', skillRoutes);

// All deal and rating routes will be prefixed with /api/deals
// e.g., POST /api/deals
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);


// 7. Define a Root Route for Health Checks
// -----------------------------------------
// This is a simple endpoint to verify that the server is running correctly.
// You can access it by navigating to http://localhost:5000/ in your browser.
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the SkillCycle API! The server is running smoothly.',
    });
});


// 8. Start the Server
// -------------------

// Get the port from environment variables, with a default fallback to 5000.
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
    console.log('====================================');
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('====================================');
});