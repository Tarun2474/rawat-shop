// backend/routes/wallpaperRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const {
  createWallpaper,
  getWallpapers,
  updateWallpaper,
  deleteWallpaper,
  updateStats
} = require('../controllers/wallpaperController');

// Public routes
router.get('/', getWallpapers);
router.patch('/:id/stats', updateStats);

// Protected Admin Routes
// We pass 'uploadImage' before 'createWallpaper' so Cloudinary processes it first
router.post('/', protect, uploadImage, createWallpaper);
router.put('/:id', protect, updateWallpaper);
router.delete('/:id', protect, deleteWallpaper);

module.exports = router;
