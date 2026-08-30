// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
  })
);

// =====================================================
// ROUTES
// =====================================================

const adminRoutes = require("./routes/adminRoutes");
const wallpaperRoutes = require("./routes/wallpaperRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RAWAT SHOP V2.0 API is running perfectly!",
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Admin
app.use("/admin", adminRoutes);

// Wallpapers
app.use("/wallpapers", wallpaperRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Express Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error Occurred",
  });
});

// =====================================================
// EXPORT EXPRESS APP
// =====================================================
//
// IMPORTANT:
// Vercel Serverless Function ke liye app ko export karna hai.
// Yahan app.listen() nahi chalega.
//

module.exports = app;