import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  getOneBudget,
  getBudgets,
  updateBudget,
} from "../controllers/budgetController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.post("/budgets", requireAuth, createBudget);
router.get("/budgets", requireAuth, getBudgets);
router.get("/budgets/:budgetId", requireAuth, getOneBudget);
router.patch("/budgets/:budgetId", requireAuth, updateBudget);
router.delete("/budgets/:budgetId", requireAuth, deleteBudget);
