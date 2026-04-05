import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true
    },
    category: {
      type: String,
      enum: ["deposit", "withdrawal", "entry_fee", "prize", "refund", "manual"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "completed"
    },
    note: {
      type: String,
      default: ""
    },
    referenceId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
