import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    amountCents: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Budget must be a whole number of cents",
      },
    },
  },
  {
    timestamps: true,
  },
);

budgetSchema.index({ userId: 1, month: 1, categoryId: 1 }, { unique: true });
const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
