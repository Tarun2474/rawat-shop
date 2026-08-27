// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "RAWAT SHOP V2.0 API is running perfectly!"
    });
});

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const wallpaperRoutes = require("./routes/wallpaperRoutes");

// Use Routes
app.use("/admin", adminRoutes);
app.use("/wallpapers", wallpaperRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message || "Server Error Occurred"
    });
});

// Create Default Admin
async function createDefaultAdmin() {
    try {
        const existingAdmin = await Admin.findOne();

        if (!existingAdmin) {
            await Admin.create({
                adminId: "Tarun004",
                password: "Rawat24004"
            });

            console.log("✅ Default Admin Created");
        } else {
            console.log("✅ Default Admin Already Exists");
        }

    } catch (err) {
        console.error("Error creating admin:", err);
    }
}

// Start Server
const startServer = async () => {
    try {

        // Connect MongoDB
        await connectDB();

        // Create Default Admin
        await createDefaultAdmin();

        // Start Express Server
        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Server Startup Error:", err);
        process.exit(1);
    }
};

startServer();