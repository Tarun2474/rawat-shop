const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  wallpaperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallpaper', required: true },
  action: { type: String, enum: ['view', 'download', 'like'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);