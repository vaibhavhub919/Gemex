import express from "express";
import {
  createTournament,
  deleteTournament,
  declareWinner,
  getMyTournaments,
  getTournaments,
  joinTournament,
  updateTournamentRoomDetails,
  updateTournamentStatus
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getTournaments);
router.get("/mine", protect, getMyTournaments);
router.post("/", protect, authorize("admin"), createTournament);
router.post("/:id/join", protect, authorize("user", "admin"), joinTournament);
router.put("/:id/status", protect, authorize("admin"), updateTournamentStatus);
router.put("/:id/room-details", protect, authorize("admin"), updateTournamentRoomDetails);
router.put("/:id/winner", protect, authorize("admin"), declareWinner);
router.delete("/:id", protect, authorize("admin"), deleteTournament);

export default router;
