import mongoose from "mongoose"

const UserCollectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    // 🔥 Overall progress through the entire collection (0-100)
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    // We can track how many resources the user has finished vs total
    completedResourcesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

// Prevent duplicate stashing of the same collection
UserCollectionSchema.index({ userId: 1, collectionId: 1 }, { unique: true })

export default mongoose.models.UserCollection ||
  mongoose.model("UserCollection", UserCollectionSchema)