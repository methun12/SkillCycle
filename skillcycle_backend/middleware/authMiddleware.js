const jwt = require('jsonwebtoken');

/**
 * Middleware function to protect routes by verifying a JWT.
 * It checks for a token in the 'Authorization' header, verifies it,
 * and if valid, attaches the decoded user information to the request object.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const authMiddleware = (req, res, next) => {
    let token;

    // 1. Check if the 'Authorization' header exists and is correctly formatted.
    // The standard format is "Bearer <token>".
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token from the header.
            // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' -> 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using the secret key from your .env file.
            // jwt.verify will throw an error if the token is invalid or expired.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. If the token is valid, the `decoded` object will contain the payload
            //    (e.g., { id: 'some_user_id', iat: ..., exp: ... }).
            //    We attach this payload to the request object as `req.user`.
            //    This makes the user's ID available in all subsequent protected controllers.
            req.user = decoded;

            // 5. Call `next()` to pass control to the next middleware or route handler.
            next();

        } catch (error) {
            // 6. Handle verification errors (e.g., TokenExpiredError, JsonWebTokenError).
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    // 7. If no token is found in the header, send a 401 Unauthorized response.
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = authMiddleware;