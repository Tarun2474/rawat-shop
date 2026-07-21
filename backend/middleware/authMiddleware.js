// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin from token, excluding password
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Not authorized, Admin not found' });
      }

      next(); // Proceed to the next function/route
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ success: false, message: 'Not authorized, Token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, No token provided' });
  }
};

module.exports = { protect };
