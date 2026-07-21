// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { authAdmin, updateAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.put('/update', protect, updateAdmin); // Protected route

module.exports = router;
