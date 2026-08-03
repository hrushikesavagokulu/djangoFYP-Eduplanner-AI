/**
 * Middleware to protect routes that require authentication.
 */
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the next middleware/route handler
        return next();
    } else {
        // User is not authenticated, return unauthorized error
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
};

module.exports = authMiddleware;
