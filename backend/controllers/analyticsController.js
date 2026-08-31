// backend/controllers/analyticsController.js

const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");

// =====================================================
// GET ANALYTICS REPORT
// Custom date filter + action filter + 3 months limit check
// =====================================================

const getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;

    const query = {};

    // 🌟 Enforce maximum 3 months (90 days) window to prevent MongoDB free tier overflow
    const maxAllowedDate = new Date();
    maxAllowedDate.setMonth(maxAllowedDate.getMonth() - 3);

    let start = startDate ? new Date(startDate) : maxAllowedDate;
    
    // If user requested a date older than 3 months, cap it to 3 months ago
    if (start < maxAllowedDate) {
      start = maxAllowedDate;
    }

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate",
      });
    }
    query.createdAt = { $gte: start };

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
        });
      }

      // Include the complete end date
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }

    // Action filter (view, download, like)
    if (action) {
      query.action = action;
    }

    // Get activity logs within the safe 3-month window
    const logs = await ActivityLog.find(query)
      .populate(
        "wallpaperId",
        "wallpaperId name category url"
      )
      .sort({ createdAt: -1 });

    // Summary metrics for the filtered range
    const totalDownloads = await ActivityLog.countDocuments({
      ...query,
      action: "download",
    });

    const totalViews = await ActivityLog.countDocuments({
      ...query,
      action: "view",
    });

    const totalLikes = await ActivityLog.countDocuments({
      ...query,
      action: "like",
    });

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
// EXPORT ANALYTICS REPORT AS EXCEL (Restricted to 3 months)
// =====================================================

const exportExcelReport = async (req, res) => {
  try {
    const maxAllowedDate = new Date();
    maxAllowedDate.setMonth(maxAllowedDate.getMonth() - 3);

    const logs = await ActivityLog.find({ createdAt: { $gte: maxAllowedDate } })
      .populate(
        "wallpaperId",
        "wallpaperId name category"
      )
      .sort({ createdAt: -1 });

    const excelData = logs.map((log) => ({
      "Wallpaper ID":
        log.wallpaperId?.wallpaperId || "N/A",

      "Wallpaper Name":
        log.wallpaperId?.name || "Deleted",

      Category:
        log.wallpaperId?.category || "N/A",

      "Action Type":
        log.action
          ? log.action.toUpperCase()
          : "UNKNOWN",

      "Date & Time":
        log.createdAt
          ? new Date(log.createdAt).toLocaleString()
          : "N/A",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "3-Month Traffic Report"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="RawatShop_3Month_Traffic_Report.xlsx"'
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Excel export error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to export Excel report",
    });
  }
};

// =====================================================
// GET SAVED REPORT EMAIL
// =====================================================

const getReportEmail = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      key: "reportEmail",
    });

    return res.json({
      success: true,
      email:
        setting?.value ||
        process.env.ADMIN_EMAIL ||
        "",
    });
  } catch (error) {
    console.error("Get report email error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to get report email",
    });
  }
};

// =====================================================
// UPDATE REPORT EMAIL
// =====================================================

const updateReportEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    await Setting.findOneAndUpdate(
      { key: "reportEmail" },
      {
        key: "reportEmail",
        value: cleanEmail,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      success: true,
      message: "Report email updated successfully!",
    });
  } catch (error) {
    console.error("Update report email error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update report email",
    });
  }
};

// =====================================================
// SEND MONTHLY EMAIL REPORT
// =====================================================

const sendMonthlyEmailReport = async () => {
  try {
    const emailSetting = await Setting.findOne({
      key: "reportEmail",
    });

    const targetEmail =
      emailSetting?.value ||
      process.env.ADMIN_EMAIL;

    if (!targetEmail) {
      throw new Error(
        "No target email configured for monthly report"
      );
    }

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.EMAIL_APP_PASSWORD
    ) {
      throw new Error(
        "Email configuration is missing"
      );
    }

    // Previous calendar month
    const now = new Date();

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0
    );

    const startOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    const dateQuery = {
      createdAt: {
        $gte: startOfPreviousMonth,
        $lt: startOfCurrentMonth,
      },
    };

    // Monthly metrics
    const totalDownloads =
      await ActivityLog.countDocuments({
        ...dateQuery,
        action: "download",
      });

    const totalViews =
      await ActivityLog.countDocuments({
        ...dateQuery,
        action: "view",
      });

    const totalLikes =
      await ActivityLog.countDocuments({
        ...dateQuery,
        action: "like",
      });

    // Gmail transporter
    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

    const monthName =
      startOfPreviousMonth.toLocaleString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: targetEmail,

      subject:
        `📊 RAWAT SHOP - ${monthName} ` +
        "Website Performance Report",

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>RAWAT SHOP V2.0</h2>

          <h3>Monthly Traffic & Performance Report</h3>

          <p>
            Here is the website performance summary
            for <strong>${monthName}</strong>.
          </p>

          <ul>
            <li>
              <strong>Total Views:</strong>
              ${totalViews}
            </li>

            <li>
              <strong>Total Downloads:</strong>
              ${totalDownloads}
            </li>

            <li>
              <strong>Total Likes:</strong>
              ${totalLikes}
            </li>
          </ul>

          <p>
            Log in to your Admin Dashboard to view
            detailed analytics and download the
            complete Excel report.
          </p>

          <p>
            Regards,<br>
            RAWAT SHOP V2.0
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `Monthly report sent successfully to ${targetEmail}`
    );

    return {
      success: true,
      targetEmail,
      month: monthName,
      metrics: {
        totalViews,
        totalDownloads,
        totalLikes,
      },
    };
  } catch (error) {
    console.error(
      "Failed to send monthly email report:",
      error
    );
    throw error;
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getAnalyticsReport,
  exportExcelReport,
  getReportEmail,
  updateReportEmail,
  sendMonthlyEmailReport,
};