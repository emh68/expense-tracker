import Category from "../models/Category.js";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";

export async function createCategory(req, res) {
  const userId = req.user._id;
  const { name, color } = req.body ?? {};
  try {
    const category = await Category.create({
      userId,
      name,
      color,
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "A category with that name already exists." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid category details." });
    }
    console.error("Could not save category:", error);
    return res.status(500).json({ error: "Could not save category." });
  }
}

export async function getCategories(req, res) {
  const userId = req.user._id;

  try {
    const categories = await Category.find({ userId }).sort({ name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Could not retrieve categories:", error);
    return res.status(500).json({ error: "Could not retrieve categories." });
  }
}

export async function getCategory(req, res) {
  const userId = req.user._id;
  const { categoryId } = req.params;

  if (!mongoose.isObjectIdOrHexString(categoryId)) {
    return res.status(400).json({ error: "A valid categoryId is required." });
  }

  try {
    const category = await Category.findOne({ userId, _id: categoryId });
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Could not retrieve category:", error);
    return res.status(500).json({ error: "Could not retrieve category." });
  }
}

export async function updateCategory(req, res) {
  const { categoryId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isObjectIdOrHexString(categoryId)) {
    return res.status(400).json({ error: "A valid categoryId is required." });
  }

  const editableFields = ["name", "color", "isActive"];
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
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    return res.status(200).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "A category with that name already exists." });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Invalid category details." });
    }

    console.error("Could not update category:", error);
    return res.status(500).json({ error: "Could not update category." });
  }
}

export async function deleteCategory(req, res) {
  const { categoryId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isObjectIdOrHexString(categoryId)) {
    return res.status(400).json({ error: "A valid categoryId is required." });
  }

  try {
    const expenses = await Expense.countDocuments({ userId, categoryId });

    if (expenses > 0) {
      return res.status(409).json({
        error: "Cannot delete a category that still has expenses.",
      });
    }
    const result = await Category.deleteOne({ _id: categoryId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Category not found." });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Could not delete category:", error);
    return res.status(500).json({ error: "Could not delete category." });
  }
}
