// backend/controllers/wallpaperController.js

const Wallpaper = require('../models/Wallpaper');
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
    // req.file comes from Cloudinary multer middleware
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { name, mainCategory, category, resolution } = req.body;
    
    // Auto Generate ID
    const nextId = await generateWallpaperId();

    // Get file size in MB
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const newWallpaper = await Wallpaper.create({
      wallpaperId: nextId,
      name,
      mainCategory,
      category,
      url: req.file.path,
      publicId: req.file.filename, // Cloudinary unique public_id
      resolution: resolution || 'Original HD',
      size: sizeInMB
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
    const wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 }); // Newest first
    res.json({ success: true, data: wallpapers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallpapers' });
  }
};

// @desc    Update wallpaper (Name, Category)
// @route   PUT /api/wallpapers/:id
// @access  Private
const updateWallpaper = async (req, res) => {
  try {
    const { name, mainCategory, category } = req.body;
    
    const wallpaper = await Wallpaper.findById(req.params.id);

    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    wallpaper.name = name || wallpaper.name;
    wallpaper.mainCategory = mainCategory || wallpaper.mainCategory;
    wallpaper.category = category || wallpaper.category;

    const updatedWallpaper = await wallpaper.save();
    res.json({ success: true, data: updatedWallpaper });
  } catch (error) {
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

    // Delete image from Cloudinary permanently
    if (wallpaper.publicId) {
      await cloudinary.uploader.destroy(wallpaper.publicId);
    }

    // Delete from MongoDB
    await wallpaper.deleteOne();

    res.json({ success: true, message: 'Wallpaper removed entirely' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete wallpaper' });
  }
};

// @desc    Update stats (Views, Downloads, Likes, Favs)
// @route   PATCH /api/wallpapers/:id/stats
// @access  Public
const updateStats = async (req, res) => {
  try {
    const { action } = req.body; // 'view', 'download', 'like', 'fav'
    
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper) {
      return res.status(404).json({ success: false, message: 'Wallpaper not found' });
    }

    if (action === 'view') wallpaper.views += 1;
    else if (action === 'download') wallpaper.downloads += 1;
    else if (action === 'like') wallpaper.likes += 1;
    else if (action === 'fav') wallpaper.favs += 1;
    else return res.status(400).json({ success: false, message: 'Invalid action' });

    await wallpaper.save();
    res.json({ success: true, message: `Stat updated for ${action}` });
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
