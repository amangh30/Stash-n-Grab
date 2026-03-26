import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: String,

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model("User", UserSchema)