import mongoose from "mongoose"

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  link: { type: String, required: true },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  saves: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema)