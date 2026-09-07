const router = require('express').Router();
const SubCategory = require('../models/SubCategory');
const protect = require('../middleware/authMiddleware'); // Admin protection

// Get all sub-categories
router.get('/', async (req, res) => {
  try {
    const categories = await SubCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new sub-category (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    let { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
    
    name = name.trim();
    
    // Check if category already exists (Case-insensitive check)
    const existing = await SubCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This category already exists!' });
    }

    const newSubCat = await SubCategory.create({ name });
    res.status(201).json({ success: true, data: newSubCat, message: 'Sub-category created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create sub-category' });
  }
});

// Delete sub-category (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    await SubCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Sub-category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;