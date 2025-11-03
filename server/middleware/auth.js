// Import jsonwebtoken
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my-secret-key');

    // Add user id to request
    req.userId = decoded.userId;

    // Continue to next middleware
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Export middleware
module.exports = auth;
