import mongoose from "mongoose"

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
  // 🔥 Reference to resources for fast population
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }]
}, { timestamps: true })

export default mongoose.models.Section || mongoose.model("Section", SectionSchema)