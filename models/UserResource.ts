import mongoose from "mongoose"

const UserResourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    progress: {
      type: Number,
      default: 0,
    },

    notes: String,

    saved: {
      type: Boolean,
      default: true,
    },

    completedAt: Date,
  },
  { timestamps: true }
)

export default mongoose.models.UserResource ||
  mongoose.model("UserResource", UserResourceSchema)