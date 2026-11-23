import { Router } from "express";
import { createExpense } from "../controllers/expenseController.js";

const router = Router();

app.get("/api/health", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

router.post("/expenses", createExpense);

export default router;
