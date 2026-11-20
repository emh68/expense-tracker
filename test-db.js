import mongoose from "mongoose";
import connectDB from "./config/db.js";

try {
  await connectDB();

  await mongoose.connection.db.admin().ping();

  console.log("Database ping successful!");
} catch (error) {
  console.error("Connection test failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
