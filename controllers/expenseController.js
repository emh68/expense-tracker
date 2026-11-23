import Expense from "../models/Expense.js";

export async function createExpense(req, res) {
  const { userId, categoryId, expenseDate, amountCents, merchant, notes } =
    req.body ?? {};
  try {
    const expense = await Expense.create({
      userId,
      categoryId,
      expenseDate,
      amountCents,
      merchant,
      notes,
    });
    return res.status(201).json(expense);
  } catch (error) {
    if (error === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Could not save expense:", error);
    return res.status(500).json({ error: "Could not save expense." });
  }
}
