// backend/controllers/adminController.js

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth admin & get token (Login)
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Check if any admin exists in DB. If DB is completely empty, create default admin.
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
  console.log("No admin found in DB. Creating default admin...");
 await Admin.create({
    adminId: "Tarun004",
    password: "Rawat24004"
});
}

    // Find admin
    const admin = await Admin.findOne({ adminId });

    // Check password
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        _id: admin._id,
        adminId: admin.adminId,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Admin ID or Password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// @desc    Update admin credentials
// @route   PUT /api/admin/update
// @access  Private (Requires Token)
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.adminId = req.body.adminId || admin.adminId;
      
      if (req.body.password) {
        admin.password = req.body.password; // pre-save hook will hash it
      }

      const updatedAdmin = await admin.save();

      res.json({
        success: true,
        message: 'Credentials updated successfully',
        _id: updatedAdmin._id,
        adminId: updatedAdmin.adminId,
        token: generateToken(updatedAdmin._id),
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error during update' });
  }
};

module.exports = {
  authAdmin,
  updateAdmin
};
