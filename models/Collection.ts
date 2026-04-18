import mongoose from "mongoose"

const CollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // 🔥 Reference to sections for fast population
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }]
}, { timestamps: true })

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema)