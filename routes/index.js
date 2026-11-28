import { Router } from "express";
import expenseRoutes from "./expenseRoutes.js";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

router.use(expenseRoutes);
router.use(authRoutes);
router.use(categoryRoutes);

export default router;
