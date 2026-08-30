// backend/routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getAnalyticsReport, 
  exportExcelReport, 
  getReportEmail, 
  updateReportEmail 
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAnalyticsReport);
router.get('/export-excel', protect, adminOnly, exportExcelReport);
router.get('/get-email', protect, adminOnly, getReportEmail);
router.post('/update-email', protect, adminOnly, updateReportEmail);

module.exports = router;