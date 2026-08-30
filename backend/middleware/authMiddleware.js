// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Protect routes - Verify Admin JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, No token provided",
      });
    }

    // Get token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, No token provided",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin from token
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, Admin not found",
      });
    }

    // Attach admin to request
    req.admin = admin;

    return next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, Token failed",
    });
  }
};

// Admin-only middleware
// Since protected routes are already authenticated by `protect`,
// this middleware confirms that an authenticated admin exists.
const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
};