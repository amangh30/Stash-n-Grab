import mongoose from "mongoose"

const CollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // 🔥 Reference to sections for fast population
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    sum: { type: Number, default: 0 } // To calculate the new average easily
  }
}, { timestamps: true })

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema)