// backend/config/db.js

const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection already in progress
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    const conn = await connectionPromise;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Reset the promise so a later serverless invocation
    // can try connecting again.
    connectionPromise = null;

    // IMPORTANT:
    // Do not use process.exit() on Vercel.
    throw error;
  }
};

module.exports = connectDB;