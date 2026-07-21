// backend/middleware/uploadMiddleware.js

const { upload } = require('../config/cloudinary');

// This middleware handles file uploading via Multer to Cloudinary
// Expects field name 'image' in the frontend form
const uploadImage = upload.single('image');

module.exports = { uploadImage };
