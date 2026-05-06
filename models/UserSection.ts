import mongoose from "mongoose"

const UserSectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  examPassed: { type: Boolean, default: false }
}, { timestamps: true })

UserSectionSchema.index({ userId: 1, sectionId: 1 }, { unique: true })

export default mongoose.models.UserSection || mongoose.model("UserSection", UserSectionSchema)