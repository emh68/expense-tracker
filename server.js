import express from "express";
import connectDB from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

try {
  await connectDB();

  const PORT = process.env.PORT || 5173;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Could not start server:", error.message);
  process.exit(1);
}
