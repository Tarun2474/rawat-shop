const ActivityLog = require('../models/ActivityLog');
const Wallpaper = require('../models/Wallpaper');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');

// @desc Get analytics report with custom date filter
const getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59))
      };
    }

    if (action) query.action = action;

    const logs = await ActivityLog.find(query).populate('wallpaperId', 'wallpaperId name category url').sort({ createdAt: -1 });
    
    // Summary metrics
    const totalDownloads = await ActivityLog.countDocuments({ ...query, action: 'download' });
    const totalViews = await ActivityLog.countDocuments({ ...query, action: 'view' });
    const totalLikes = await ActivityLog.countDocuments({ ...query, action: 'like' });

    res.json({
      success: true,
      metrics: { totalDownloads, totalViews, totalLikes },
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Export report as Excel
const exportExcelReport = async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).populate('wallpaperId', 'wallpaperId name category').sort({ createdAt: -1 });

    const excelData = logs.map(log => ({
      'Wallpaper ID': log.wallpaperId?.wallpaperId || 'N/A',
      'Wallpaper Name': log.wallpaperId?.name || 'Deleted',
      'Category': log.wallpaperId?.category || 'N/A',
      'Action Type': log.action.toUpperCase(),
      'Date & Time': new Date(log.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Website Traffic Report");

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="RawatShop_Traffic_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Send automated monthly report to Gmail
const sendMonthlyEmailReport = async () => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    const totalDownloads = await ActivityLog.countDocuments({ action: 'download', createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
    const totalViews = await ActivityLog.countDocuments({ action: 'view', createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
    const totalLikes = await ActivityLog.countDocuments({ action: 'like', createdAt: { $gte: startOfMonth, $lte: endOfMonth } });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: '📊 RAWAT SHOP - Monthly Website Performance Report',
      html: `
        <h2>Monthly Traffic & Performance Report</h2>
        <p>Here is the summary of your website traffic for the past month:</p>
        <ul>
          <li><b>Total Views:</b> ${totalViews}</li>
          <li><b>Total Downloads:</b> ${totalDownloads}</li>
          <li><b>Total Likes:</b> ${totalLikes}</li>
        </ul>
        <p>Log in to your Admin Dashboard to download the complete Excel sheet.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Monthly Report email sent successfully!");
  } catch (error) {
    console.error("Failed to send monthly email report:", error);
  }
};

module.exports = { getAnalyticsReport, exportExcelReport, sendMonthlyEmailReport };