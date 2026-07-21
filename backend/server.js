// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'], // Frontend URLs
  credentials: true
}));
app.use(express.json()); // To parse JSON data
app.use(express.urlencoded({ extended: true }));

// Basic Route for testing server
app.get('/', (req, res) => {
  res.json({ message: 'RAWAT SHOP V2.0 API is running perfectly!' });
});

// Import Routes (Inko hum next step me banayenge)
const adminRoutes = require('./routes/adminRoutes');
const wallpaperRoutes = require('./routes/wallpaperRoutes');

// Use Routes
app.use('/api/admin', adminRoutes);
app.use('/api/wallpapers', wallpaperRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Server Error Occurred' 
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in production-ready mode on port ${PORT}`);
});

const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

// Auto create admin on startup
async function createDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: "Tarun004" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Rawat24004", 10);
      await Admin.create({
        username: "Tarun004",
        password: hashedPassword
      });
      console.log("Default admin created successfully!");
    }
  } catch (err) {
    console.log("Error creating admin:", err);
  }
}
createDefaultAdmin();
