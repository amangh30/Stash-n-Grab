import mongoose from "mongoose"

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    link: String,

    tags: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 Metrics (for future)
    saves: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema)