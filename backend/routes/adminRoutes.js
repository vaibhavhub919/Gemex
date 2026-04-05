import express from "express";
import {
  getAdminTournaments,
  getDashboardStats,
  getPaymentSettings,
  getPendingWalletRequests,
  getUsers,
  reviewDeposit,
  updatePaymentSettings,
  reviewWithdrawal
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.get("/tournaments", getAdminTournaments);
router.get("/payment-settings", getPaymentSettings);
router.get("/wallet-requests", getPendingWalletRequests);
router.put("/payment-settings", updatePaymentSettings);
router.put("/deposits/:id", reviewDeposit);
router.put("/withdrawals/:id", reviewWithdrawal);

export default router;
