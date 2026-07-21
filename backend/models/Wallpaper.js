// backend/models/Wallpaper.js

const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  wallpaperId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mainCategory: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true // Cloudinary URL
  },
  publicId: {
    type: String,
    required: true // Required for deleting image from Cloudinary
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  favs: {
    type: Number,
    default: 0
  },
  resolution: {
    type: String,
    default: 'Original'
  },
  size: {
    type: String, // e.g., '3.2 MB'
    default: '0 MB'
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
