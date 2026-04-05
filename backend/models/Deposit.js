import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    method: {
      type: String,
      default: "UPI"
    },
    upiTransactionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    remark: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Deposit = mongoose.model("Deposit", depositSchema);

export default Deposit;
