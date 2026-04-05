import Deposit from "../models/Deposit.js";
import PaymentSetting from "../models/PaymentSetting.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

export const getWalletOverview = async (req, res) => {
  try {
    const [user, transactions, deposits, withdrawals, settings] = await Promise.all([
      User.findById(req.user._id).select("walletBalance upiId"),
      Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
      Deposit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
      Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
      PaymentSetting.findOne({ key: "default" })
    ]);

    return res.status(200).json({
      balance: user?.walletBalance || 0,
      upiId: user?.upiId || "",
      depositQrImageUrl: settings?.depositQrImageUrl || "",
      transactions,
      deposits,
      withdrawals
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load wallet data." });
  }
};

export const requestDeposit = async (req, res) => {
  try {
    const { amount, upiTransactionId } = req.body;

    if (!amount || !upiTransactionId) {
      return res.status(400).json({ message: "Amount and UPI transaction ID are required." });
    }

    const deposit = await Deposit.create({
      user: req.user._id,
      amount,
      upiTransactionId
    });

    await Transaction.create({
      user: req.user._id,
      type: "credit",
      category: "deposit",
      amount,
      status: "pending",
      note: "Deposit request submitted"
    });

    return res.status(201).json({
      message: "Deposit request submitted.",
      deposit
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Deposit request failed." });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const user = await User.findById(req.user._id);

    if (!amount || !upiId) {
      return res.status(400).json({ message: "Amount and UPI ID are required." });
    }

    if (!user || user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance for withdrawal." });
    }

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      upiId
    });

    await Transaction.create({
      user: req.user._id,
      type: "debit",
      category: "withdrawal",
      amount,
      status: "pending",
      note: "Withdrawal request submitted"
    });

    return res.status(201).json({
      message: "Withdrawal request submitted.",
      withdrawal
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Withdrawal request failed." });
  }
};
