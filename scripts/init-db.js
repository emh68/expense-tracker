import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

const models = [User, Category, Expense, Budget];

try {
  await connectDB();

  // Initialize collections and schema indexes.
  for (const model of models) {
    await model.init();
    console.log(`Initialized: ${model.collection.name}`);
  }

  // Verify that the collections exist.
  const collections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();

  console.log(
    "Database collections:",
    collections.map((collection) => collection.name),
  );
} catch (error) {
  console.error("Database initialization failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
