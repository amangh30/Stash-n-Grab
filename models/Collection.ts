import mongoose from "mongoose"

const CollectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      sum: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

// 🔥 CRITICAL: Create a compound text index for the infinite scroll query pipeline
CollectionSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 5 } } // Title matches score higher than description matches
)

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema)