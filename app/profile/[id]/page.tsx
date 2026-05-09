import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import UserCollection from "@/models/UserCollection"
import PublicProfileClient from "./PublicProfileClient"
import mongoose from "mongoose"
import { notFound } from "next/navigation"

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // 1. Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound() // Triggers the Next.js 404 page
  }

  await connectDB()

  // 2. Fetch the target user
  const targetUser = await User.findById(id).lean()
  if (!targetUser) {
    notFound()
  }

  // 3. Fetch what this user is learning (Stashed Paths)
  const userCollections = await UserCollection.find({ userId: targetUser._id })
    .populate("collectionId", "title description sections")
    .sort({ createdAt: -1 })
    .lean()

  // 4. Sanitize data for the client (converting ObjectIds to strings)
  const safeUser = JSON.parse(JSON.stringify(targetUser))
  const safeCollections = JSON.parse(JSON.stringify(userCollections))

  return (
    <PublicProfileClient 
      user={safeUser} 
      userCollections={safeCollections} 
    />
  )
}