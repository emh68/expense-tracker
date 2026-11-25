import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expenseController.js";

const router = Router();

router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);
router.patch(
  "/expenses/:expenseId",
  /*
    #swagger.parameters['userId'] = {
      in: 'query',
      required: true,
      type: 'string'
    }
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
router.delete("/expenses/:expenseId", deleteExpense);
export default router;
