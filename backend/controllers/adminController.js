import Deposit from "../models/Deposit.js";
import PaymentSetting from "../models/PaymentSetting.js";
import Tournament from "../models/Tournament.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";

const getPaymentSettingDocument = async () => {
  return PaymentSetting.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", depositQrImageUrl: "" } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
};

const syncTransactionStatus = async (userId, category, amount, status, note) => {
  const transaction = await Transaction.findOne({
    user: userId,
    category,
    amount,
    status: "pending"
  }).sort({ createdAt: -1 });

  if (transaction) {
    transaction.status = status;
    transaction.note = note;
    await transaction.save();
  }
};

export const getDashboardStats = async (_req, res) => {
  try {
    const [users, tournaments, pendingDeposits, pendingWithdrawals, totalTransactions] =
      await Promise.all([
        User.countDocuments(),
        Tournament.countDocuments(),
        Deposit.countDocuments({ status: "pending" }),
        Withdrawal.countDocuments({ status: "pending" }),
        Transaction.countDocuments()
      ]);

    return res.status(200).json({
      stats: {
        users,
        tournaments,
        pendingDeposits,
        pendingWithdrawals,
        totalTransactions
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load dashboard stats." });
  }
};

export const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch users." });
  }
};

export const getAdminTournaments = async (_req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("winner", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ tournaments });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch tournaments." });
  }
};

export const getPendingWalletRequests = async (_req, res) => {
  try {
    const [deposits, withdrawals] = await Promise.all([
      Deposit.find({ status: "pending" }).populate("user", "name email").sort({ createdAt: -1 }),
      Withdrawal.find({ status: "pending" })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
    ]);

    return res.status(200).json({ deposits, withdrawals });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch wallet requests." });
  }
};

export const getPaymentSettings = async (_req, res) => {
  try {
    const settings = await getPaymentSettingDocument();
    return res.status(200).json({ settings });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load payment settings." });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const settings = await getPaymentSettingDocument();
    settings.depositQrImageUrl = req.body.depositQrImageUrl?.trim() || "";
    await settings.save();

    return res.status(200).json({
      message: "Payment settings updated successfully.",
      settings
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update payment settings." });
  }
};

export const reviewDeposit = async (req, res) => {
  try {
    const { status, remark } = req.body;
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: "Deposit request not found." });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({ message: "Deposit request already reviewed." });
    }

    deposit.status = status;
    deposit.remark = remark || "";
    await deposit.save();

    if (status === "approved") {
      const user = await User.findById(deposit.user);
      user.walletBalance += deposit.amount;
      await user.save();
    }

    await syncTransactionStatus(
      deposit.user,
      "deposit",
      deposit.amount,
      status,
      remark || `Deposit ${status}`
    );

    return res.status(200).json({
      message: `Deposit ${status} successfully.`,
      deposit
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to review deposit." });
  }
};

export const reviewWithdrawal = async (req, res) => {
  try {
    const { status, remark } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal request already reviewed." });
    }

    withdrawal.status = status;
    withdrawal.remark = remark || "";
    await withdrawal.save();

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (status === "approved") {
      user.walletBalance -= withdrawal.amount;
    }

    await user.save();
    await syncTransactionStatus(
      withdrawal.user,
      "withdrawal",
      withdrawal.amount,
      status,
      remark || `Withdrawal ${status}`
    );

    return res.status(200).json({
      message: `Withdrawal ${status} successfully.`,
      withdrawal
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to review withdrawal." });
  }
};
