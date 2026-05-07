import mongoose from "mongoose";

const UserRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

// 🔥 Unique index prevents the same user from rating the same collection twice
UserRatingSchema.index({ userId: 1, collectionId: 1 }, { unique: true });

export default mongoose.models.UserRating || mongoose.model("UserRating", UserRatingSchema);