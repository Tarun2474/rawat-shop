const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");

// =====================================================
// GET ANALYTICS REPORT
// Custom date filter + action filter
// =====================================================

const getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;

    const query = {};

    // -----------------------------------------------------
    // Date filter
    // startDate = 00:00:00.000
    // endDate   = 23:59:59.999
    // -----------------------------------------------------
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        if (
          typeof startDate !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate. Expected format: YYYY-MM-DD",
          });
        }

        const start = new Date(`${startDate}T00:00:00.000`);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        query.createdAt.$gte = start;
      }

      if (endDate) {
        if (
          typeof endDate !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate. Expected format: YYYY-MM-DD",
          });
        }

        const end = new Date(`${endDate}T23:59:59.999`);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        query.createdAt.$lte = end;
      }

      // Prevent an invalid reversed range.
      if (
        query.createdAt.$gte &&
        query.createdAt.$lte &&
        query.createdAt.$gte > query.createdAt.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "startDate cannot be later than endDate",
        });
      }
    }

    // -----------------------------------------------------
    // Action filter
    // -----------------------------------------------------
    if (action) {
      query.action = action;
    }

    // -----------------------------------------------------
    // Fetch activity logs + summary metrics
    // -----------------------------------------------------
    const [logs, totalDownloads, totalViews, totalLikes] =
      await Promise.all([
        ActivityLog.find(query)
          .populate(
            "wallpaperId",
            "wallpaperId name category url"
          )
          .sort({ createdAt: -1 }),

        ActivityLog.countDocuments({
          ...query,
          action: "download",
        }),

        ActivityLog.countDocuments({
          ...query,
          action: "view",
        }),

        ActivityLog.countDocuments({
          ...query,
          action: "like",
        }),
      ]);

    return res.json({
      success: true,

      metrics: {
        totalDownloads,
        totalViews,
        totalLikes,
      },

      // Useful for frontend chart rendering.
      totalRecords: logs.length,

      data: logs,
    });
  } catch (error) {
    console.error("Analytics report error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to generate analytics report",
    });
  }
};

// =====================================================
// EXPORT ANALYTICS REPORT AS EXCEL
// =====================================================

const exportExcelReport = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
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
      "Website Traffic Report"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="RawatShop_Traffic_Report.xlsx"'
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
          <p>Here is the website performance summary for <strong>${monthName}</strong>.</p>
          <ul>
            <li><strong>Total Views:</strong> ${totalViews}</li>
            <li><strong>Total Downloads:</strong> ${totalDownloads}</li>
            <li><strong>Total Likes:</strong> ${totalLikes}</li>
          </ul>
          <p>Log in to your Admin Dashboard to view detailed analytics.</p>
          <p>Regards,<br>RAWAT SHOP V2.0</p>
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

module.exports = {
  getAnalyticsReport,
  exportExcelReport,
  getReportEmail,
  updateReportEmail,
  sendMonthlyEmailReport,
};