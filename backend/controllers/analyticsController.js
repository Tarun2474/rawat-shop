// backend/controllers/analyticsController.js

const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");

// =====================================================
// GET ANALYTICS REPORT (Original Simple Version)
// =====================================================

const getAnalyticsReport = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate("wallpaperId", "wallpaperId name category url")
      .sort({ createdAt: -1 });

    const totalDownloads = await ActivityLog.countDocuments({ action: "download" });
    const totalViews = await ActivityLog.countDocuments({ action: "view" });
    const totalLikes = await ActivityLog.countDocuments({ action: "like" });

    return res.json({
      success: true,
      metrics: {
        totalDownloads,
        totalViews,
        totalLikes,
      },
      data: logs,
    });
  } catch (error) {
    console.error("Analytics report error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate analytics report",
    });
  }
};

// =====================================================
// EXPORT ANALYTICS REPORT AS EXCEL
// =====================================================

const exportExcelReport = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate("wallpaperId", "wallpaperId name category")
      .sort({ createdAt: -1 });

    const excelData = logs.map((log) => ({
      "Wallpaper ID": log.wallpaperId?.wallpaperId || "N/A",
      "Wallpaper Name": log.wallpaperId?.name || "Deleted",
      "Category": log.wallpaperId?.category || "N/A",
      "Action Type": log.action ? log.action.toUpperCase() : "UNKNOWN",
      "Date & Time": log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Website Traffic Report");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader("Content-Disposition", 'attachment; filename="RawatShop_Traffic_Report.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return res.send(buffer);
  } catch (error) {
    console.error("Excel export error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export Excel report",
    });
  }
};

const getReportEmail = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "reportEmail" });
    return res.json({
      success: true,
      email: setting?.value || process.env.ADMIN_EMAIL || "",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReportEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    await Setting.findOneAndUpdate(
      { key: "reportEmail" },
      { key: "reportEmail", value: email.trim() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, message: "Report email updated successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendMonthlyEmailReport = async () => {
  return { success: true };
};

module.exports = {
  getAnalyticsReport,
  exportExcelReport,
  getReportEmail,
  updateReportEmail,
  sendMonthlyEmailReport,
};