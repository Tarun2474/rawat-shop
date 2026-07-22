// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware - CORS fix taaki error na aaye
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json()); // To parse JSON data
app.use(express.urlencoded({ extended: true }));

// Basic Route for testing server
app.get('/', (req, res) => {
    res.json({ message: 'RAWAT SHOP V2.0 API is running perfectly!' });
});

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const wallpaperRoutes = require('./routes/wallpaperRoutes');

// Use Routes (Bina /api ke taaki frontend se match ho jaye)
app.use('/admin', adminRoutes);
app.use('/wallpapers', wallpaperRoutes);

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

// Auto create admin on startup (Bina password hash ke taaki seedha login ho jaye)
async function createDefaultAdmin() {
    try {
        const existingAdmin = await Admin.findOne({ username: "Tarun004" });
        if (!existingAdmin) {
            await Admin.create({
                adminId: "1",
                username: "Tarun004",
                password: "Rawat24004"
            });
            console.log("Default admin created successfully!");
        }
    } catch (err) {
        console.log("Error creating admin:", err);
    }
}

createDefaultAdmin();