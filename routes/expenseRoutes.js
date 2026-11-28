import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expenseController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.post("/expenses", requireAuth, createExpense);
router.get("/expenses", requireAuth, getExpenses);
router.patch(
  "/expenses/:expenseId",
  requireAuth,
  /*
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        categoryId: '507f1f77bcf86cd799439012',
        expenseDate: '2026-11-23',
        amountCents: 2450,
        merchant: 'Trader Joe’s',
        notes: 'Test update'
      }
    }
  */
  updateExpense,
);
router.delete("/expenses/:expenseId", requireAuth, deleteExpense);
export default router;
