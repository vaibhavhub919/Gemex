import Tournament from "../models/Tournament.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const getRoomDetailsAccessState = (tournament) => {
  const now = Date.now();
  const startTime = new Date(tournament.startTime).getTime();
  const unlockTime = startTime - 10 * 60 * 1000;

  if (tournament.status === "completed" || tournament.status === "cancelled") {
    return {
      allowed: false,
      message: "Room details cannot be updated for completed or cancelled tournaments."
    };
  }

  if (now < unlockTime) {
    return {
      allowed: false,
      message: "Room details can only be added 10 minutes before start time."
    };
  }

  return { allowed: true };
};

export const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create({
      ...req.body,
      createdBy: req.user._id
    });

    return res.status(201).json({
      message: "Tournament created successfully.",
      tournament
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Tournament creation failed." });
  }
};

export const getTournaments = async (_req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("winner", "name email")
      .sort({ startTime: 1 });

    return res.status(200).json({ tournaments });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch tournaments." });
  }
};

export const getMyTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ "participants.user": req.user._id }).sort({
      startTime: 1
    });

    return res.status(200).json({ tournaments });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch user tournaments." });
  }
};

export const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyJoined = tournament.participants.some(
      (participant) => participant.user.toString() === user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: "You have already joined this tournament." });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: "Tournament is already full." });
    }

    if (user.walletBalance < tournament.entryFee) {
      return res.status(400).json({ message: "Insufficient wallet balance." });
    }

    user.walletBalance -= tournament.entryFee;
    tournament.participants.push({ user: user._id });
    user.joinedTournaments.push(tournament._id);

    await Promise.all([
      user.save(),
      tournament.save(),
      Transaction.create({
        user: user._id,
        type: "debit",
        category: "entry_fee",
        amount: tournament.entryFee,
        status: "completed",
        note: `Joined ${tournament.title}`
      })
    ]);

    return res.status(200).json({
      message: "Tournament joined successfully.",
      tournament
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to join tournament." });
  }
};

export const updateTournamentStatus = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    return res.status(200).json({
      message: "Tournament updated successfully.",
      tournament
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Tournament update failed." });
  }
};

export const updateTournamentRoomDetails = async (req, res) => {
  try {
    const { roomId, roomPassword } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const accessState = getRoomDetailsAccessState(tournament);
    if (!accessState.allowed) {
      return res.status(400).json({ message: accessState.message });
    }

    if (!roomId?.trim() || !roomPassword?.trim()) {
      return res.status(400).json({ message: "Room ID and room password are required." });
    }

    tournament.roomId = roomId.trim();
    tournament.roomPassword = roomPassword.trim();

    if (tournament.status === "upcoming") {
      tournament.status = "live";
    }

    await tournament.save();

    return res.status(200).json({
      message: "Room details updated successfully.",
      tournament
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update room details." });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    await Promise.all([
      User.updateMany(
        { joinedTournaments: tournament._id },
        { $pull: { joinedTournaments: tournament._id } }
      ),
      Tournament.findByIdAndDelete(tournament._id)
    ]);

    return res.status(200).json({ message: "Tournament deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Tournament deletion failed." });
  }
};

export const declareWinner = async (req, res) => {
  try {
    const { winnerId, prizeAmount } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const winner = await User.findById(winnerId);
    if (!winner) {
      return res.status(404).json({ message: "Winner not found." });
    }

    tournament.winner = winner._id;
    tournament.status = "completed";

    if (prizeAmount) {
      winner.walletBalance += Number(prizeAmount);
      await Promise.all([
        winner.save(),
        Transaction.create({
          user: winner._id,
          type: "credit",
          category: "prize",
          amount: Number(prizeAmount),
          status: "completed",
          note: `Prize for ${tournament.title}`
        }),
        tournament.save()
      ]);
    } else {
      await tournament.save();
    }

    return res.status(200).json({
      message: "Winner declared successfully.",
      tournament
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Winner declaration failed." });
  }
};
