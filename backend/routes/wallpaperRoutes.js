// backend/routes/wallpaperRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const Wallpaper = require('../models/Wallpaper'); // Wallpaper model import kiya
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
router.post('/', protect, uploadImage, createWallpaper);
router.put('/:id', protect, uploadImage, updateWallpaper);
router.delete('/:id', protect, deleteWallpaper);

// PATCH: Toggle Cover Flow status (Admin Only)
router.patch('/:id/coverflow', protect, async (req, res) => {
  try {
    const { isCoverFlow } = req.body;
    const wallpaper = await Wallpaper.findByIdAndUpdate(
      req.params.id,
      { isCoverFlow },
      { new: true }
    );
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: "Wallpaper not found" });
    }
    res.json({ success: true, wallpaper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;