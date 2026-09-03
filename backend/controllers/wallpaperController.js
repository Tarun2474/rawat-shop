// backend/controllers/wallpaperController.js

const Wallpaper = require('../models/Wallpaper');
const ActivityLog = require('../models/ActivityLog');
const { cloudinary } = require('../config/cloudinary');

// Helper to generate Auto ID like WLP001, WLP002
const generateWallpaperId = async () => {
  const lastWallpaper = await Wallpaper.findOne().sort({ createdAt: -1 });
  if (!lastWallpaper) return 'WLP001';
  
  const lastId = lastWallpaper.wallpaperId;
  const numberPart = parseInt(lastId.replace('WLP', ''));
  return `WLP${String(numberPart + 1).padStart(3, '0')}`;
};

// @desc    Create new wallpaper (Upload)
// @route   POST /api/wallpapers
// @access  Private
const createWallpaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    let { name, mainCategory, category, resolution, isCoverFlow } = req.body;
    
    if (typeof mainCategory === 'string') {
      try {
        mainCategory = JSON.parse(mainCategory);
      } catch (err) {
        mainCategory = [mainCategory];
      }
    }

    const nextId = await generateWallpaperId();
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const newWallpaper = await Wallpaper.create({
      wallpaperId: nextId,
      name,
      mainCategory,
      category,
      url: req.file.path,
      publicId: req.file.filename,
      resolution: resolution || 'Original HD',
      size: sizeInMB,
      isCoverFlow: isCoverFlow === 'true' || isCoverFlow === true
    });

    res.status(201).json({ success: true, data: newWallpaper });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to upload wallpaper' });
  }
};

// @desc    Get all wallpapers
// @route   GET /api/wallpapers
// @access  Public
const getWallpapers = async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: wallpapers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallpapers' });
  }
};

// @desc    Update wallpaper (Name, Category, Image Replacement, CoverFlow flag, Custom Stats)
// @route   PUT /api/wallpapers/:id
// @access  Private
const updateWallpaper = async (req, res) => {
  try {
    let { name, mainCategory, category, views, downloads, likes, isCoverFlow } = req.body;
    
    const wallpaper = await Wallpaper.findById(req.params.id);

    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    if (typeof mainCategory === 'string') {
      try {
        mainCategory = JSON.parse(mainCategory);
      } catch (err) {
        // keep as is
      }
    }

    // If a new image file is uploaded during edit, replace the old one in Cloudinary
    if (req.file) {
      if (wallpaper.publicId) {
        await cloudinary.uploader.destroy(wallpaper.publicId);
      }
      wallpaper.url = req.file.path;
      wallpaper.publicId = req.file.filename;
      wallpaper.size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    wallpaper.name = name || wallpaper.name;
    wallpaper.mainCategory = mainCategory || wallpaper.mainCategory;
    wallpaper.category = category || wallpaper.category;
    wallpaper.isCoverFlow = isCoverFlow === 'true' || isCoverFlow === true;
    
    if (views !== undefined) wallpaper.views = Number(views);
    if (downloads !== undefined) wallpaper.downloads = Number(downloads);
    if (likes !== undefined) wallpaper.likes = Number(likes);

    const updatedWallpaper = await wallpaper.save();
    res.json({ success: true, data: updatedWallpaper });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update wallpaper' });
  }
};

// @desc    Delete wallpaper
// @route   DELETE /api/wallpapers/:id
// @access  Private
const deleteWallpaper = async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);

    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    if (wallpaper.publicId) {
      await cloudinary.uploader.destroy(wallpaper.publicId);
    }

    await wallpaper.deleteOne();

    res.json({ success: true, message: 'Wallpaper removed entirely' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete wallpaper' });
  }
};

// @desc    Update stats & Record Activity Log
// @route   PATCH /api/wallpapers/:id/stats
// @access  Public
const updateStats = async (req, res) => {
  try {
    const { action } = req.body;
    
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    if (action === 'view') wallpaper.views += 1;
    else if (action === 'download') wallpaper.downloads += 1;
    else if (action === 'like') wallpaper.likes += 1;
    else if (action === 'unlike') wallpaper.likes = Math.max(0, wallpaper.likes - 1);
    else if (action === 'fav') wallpaper.favs += 1;
    else if (action === 'unfav') wallpaper.favs = Math.max(0, wallpaper.favs - 1);
    else return res.status(400).json({ success: false, message: 'Invalid action' });

    await wallpaper.save();

    if (['view', 'download', 'like'].includes(action)) {
      await ActivityLog.create({
        wallpaperId: wallpaper._id,
        action: action
      });
    }

    res.json({ success: true, message: `Stat updated for ${action}`, data: wallpaper });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stats' });
  }
};

module.exports = {
  createWallpaper,
  getWallpapers,
  updateWallpaper,
  deleteWallpaper,
  updateStats
};