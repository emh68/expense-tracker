import Expense from "../models/Expense.js";
import mongoose from "mongoose";

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
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Could not save expense:", error);
    return res.status(500).json({ error: "Could not save expense." });
  }
}

export async function getExpenses(req, res) {
  const { userId } = req.query;

  if (!mongoose.isObjectIdOrHexString(userId)) {
    return res.status(400).json({ error: "A valid userId is required." });
  }

  try {
    const expenses = await Expense.find({ userId }).sort({ expenseDate: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Could not retrieve expenses:", error);
    return res.status(500).json({ error: "Could not retrieve expenses." });
  }
}

export async function updateExpense(req, res) {
  const { expenseId } = req.params;
  //this line is commented out until we implement Authentication or PATCH will crash at runtime
  //const userId = req.user._id;
  const { userId } = req.query;

  if (!mongoose.isObjectIdOrHexString(expenseId)) {
    return res.status(400).json({ error: "A valid expenseId is required." });
  }

  if (!mongoose.isObjectIdOrHexString(userId)) {
    return res.status(400).json({ error: "A valid userId is required." });
  }

  const editableFields = [
    "categoryId",
    "expenseDate",
    "amountCents",
    "merchant",
    "notes",
  ];
  const updates = {};

  for (const field of editableFields) {
    if (Object.hasOwn(req.body ?? {}, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Provide a field to update." });
  }

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    return res.status(200).json(expense);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Invalid expense details." });
    }

    console.error("Could not update expense:", error);
    return res.status(500).json({ error: "Could not update expense." });
  }
}

export async function deleteExpense(req, res) {
  const { expenseId } = req.params;
  const { userId } = req.query;

  if (!mongoose.isObjectIdOrHexString(expenseId)) {
    return res.status(400).json({ error: "A valid expenseId is required." });
  }

  if (!mongoose.isObjectIdOrHexString(userId)) {
    return res.status(400).json({ error: "A valid userId is required." });
  }

  try {
    const result = await Expense.deleteOne({ _id: expenseId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Could not delete expenses:", error);
    return res.status(500).json({ error: "Could not delete expenses." });
  }
}
