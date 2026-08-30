// backend/routes/analyticsRoutes.js

const express = require("express");
const router = express.Router();

const {
  getAnalyticsReport,
  exportExcelReport,
  getReportEmail,
  updateReportEmail,
  sendMonthlyEmailReport,
} = require("../controllers/analyticsController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// =====================================================
// ADMIN ANALYTICS ROUTES
// =====================================================

// Get analytics report with date/action filters
router.get(
  "/",
  protect,
  adminOnly,
  getAnalyticsReport
);

// Export complete analytics report as Excel
router.get(
  "/export-excel",
  protect,
  adminOnly,
  exportExcelReport
);

// Get saved report email
router.get(
  "/get-email",
  protect,
  adminOnly,
  getReportEmail
);

// Update saved report email
router.post(
  "/update-email",
  protect,
  adminOnly,
  updateReportEmail
);

// =====================================================
// AUTOMATED MONTHLY REPORT
// =====================================================
//
// This route is called by Vercel Cron.
// It does NOT use admin JWT authentication because
// Vercel Cron uses CRON_SECRET instead.
//
// Vercel sends:
// Authorization: Bearer <CRON_SECRET>
//

router.get("/monthly-report", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error("CRON_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Cron configuration is missing",
      });
    }

    const expectedAuth = `Bearer ${expectedToken}`;

    if (authHeader !== expectedAuth) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized cron request",
      });
    }

    await sendMonthlyEmailReport();

    return res.status(200).json({
      success: true,
      message: "Monthly report processed successfully",
    });
  } catch (error) {
    console.error("Monthly report route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process monthly report",
    });
  }
});

module.exports = router;