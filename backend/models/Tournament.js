import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    game: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    entryFee: {
      type: Number,
      required: true,
      min: 0
    },
    prizePool: {
      type: Number,
      required: true,
      min: 0
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2
    },
    startTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming"
    },
    roomId: {
      type: String,
      default: ""
    },
    roomPassword: {
      type: String,
      default: ""
    },
    participants: [participantSchema],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
