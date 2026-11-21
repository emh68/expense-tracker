import express from "express";
import connectDB from "./config/db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

// Determine the root directory of the project.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

// Serve the built frontend from Vite.
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

try {
  await connectDB();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Could not start server:", error.message);
  process.exit(1);
}
