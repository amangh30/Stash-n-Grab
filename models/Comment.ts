import mongoose from "mongoose"

const CommentSchema = new mongoose.Schema({
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
}, { timestamps: true })

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema)