import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";

export async function createBudget(req, res) {
  const userId = req.user._id;
  const { month, amountCents, categoryId = null } = req.body ?? {};
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Month must be in YYYY-MM format." });
  }

  if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
    return res.status(400).json({
      error: "amountCents must be a non-negative whole number of cents.",
    });
  }

  if (categoryId !== null && !mongoose.isObjectIdOrHexString(categoryId)) {
    return res.status(400).json({ error: "A valid categoryId is required." });
  }
  try {
    if (categoryId !== null) {
      const category = await Category.exists({ _id: categoryId, userId });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }
    const budget = await Budget.create({
      userId,
      month,
      categoryId,
      amountCents,
    });
    return res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "A budget already exists for that month and category.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid budget details." });
    }
    console.error("Could not create budget:", error);
    return res.status(500).json({ error: "Could not create budget." });
  }
}

export async function getBudgets(req, res) {
  const userId = req.user._id;
  const { month } = req.query;

  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ error: "Month must be in YYYY-MM format." });
  }

  try {
    const budgets = await Budget.find({ userId, month });
    return res.status(200).json(budgets);
  } catch (error) {
    console.error("Could not retrieve budgets:", error);
    return res.status(500).json({ error: "Could not retrieve budgets." });
  }
}

export async function getOneBudget(req, res) {
  const userId = req.user._id;
  const { budgetId } = req.params;

  if (!mongoose.isObjectIdOrHexString(budgetId)) {
    return res.status(400).json({ error: "A valid budgetId is required." });
  }

  try {
    const budget = await Budget.findOne({ userId, _id: budgetId });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found." });
    }

    return res.status(200).json(budget);
  } catch (error) {
    console.error("Could not retrieve budget:", error);
    return res.status(500).json({ error: "Could not retrieve budget." });
  }
}

export async function updateBudget(req, res) {
  const { budgetId } = req.params;
  const userId = req.user._id;
  const body = req.body ?? {};
  const updates = {};

  if (!mongoose.isObjectIdOrHexString(budgetId)) {
    return res.status(400).json({ error: "A valid budgetId is required." });
  }

  if (Object.hasOwn(body, "month")) {
    if (
      typeof body.month !== "string" ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(body.month)
    ) {
      return res
        .status(400)
        .json({ error: "Month must be in YYYY-MM format." });
    }

    updates.month = body.month;
  }

  if (Object.hasOwn(body, "amountCents")) {
    if (!Number.isSafeInteger(body.amountCents) || body.amountCents < 0) {
      return res.status(400).json({
        error: "amountCents must be a non-negative whole number of cents.",
      });
    }

    updates.amountCents = body.amountCents;
  }

  if (Object.hasOwn(body, "categoryId")) {
    if (
      body.categoryId !== null &&
      !mongoose.isObjectIdOrHexString(body.categoryId)
    ) {
      return res.status(400).json({ error: "A valid categoryId is required." });
    }

    updates.categoryId = body.categoryId;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: "Provide month, amountCents, or categoryId to update.",
    });
  }

  try {
    if (updates.categoryId) {
      const category = await Category.exists({
        _id: updates.categoryId,
        userId,
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!budget) {
      return res.status(404).json({ error: "Budget not found." });
    }

    return res.status(200).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "A budget already exists for that month and category.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Invalid budget details." });
    }

    console.error("Could not update budget:", error);
    return res.status(500).json({ error: "Could not update budget." });
  }
}

export async function deleteBudget(req, res) {
  const { budgetId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isObjectIdOrHexString(budgetId)) {
    return res.status(400).json({ error: "A valid budgetId is required." });
  }

  try {
    const result = await Budget.deleteOne({ _id: budgetId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Budget not found." });
    }

    return res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Could not delete budget:", error);
    return res.status(500).json({ error: "Could not delete budget." });
  }
}
