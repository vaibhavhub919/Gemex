import express from "express";
import {
  getWalletOverview,
  requestDeposit,
  requestWithdrawal
} from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWalletOverview);
router.post("/deposit", protect, requestDeposit);
router.post("/withdraw", protect, requestWithdrawal);

export default router;
