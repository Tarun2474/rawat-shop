// backend/api/index.js

const app = require("../server");
const connectDB = require("../config/db");

const handler = async (req, res) => {
  try {
    // Connect to MongoDB before handling the request.
    // db.js reuses an existing connection when possible.
    await connectDB();

    // Pass the request to the existing Express application.
    return app(req, res);
  } catch (error) {
    console.error("Vercel API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = handler;