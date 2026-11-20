import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("mongo_uri is missing from .env");
    }
    await mongoose.connect(uri, {
      dbName: "expense_tracker",
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Mongo connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
