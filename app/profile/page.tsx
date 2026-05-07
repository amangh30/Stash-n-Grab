import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import UserCollection from "@/models/UserCollection"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  // 1. Fetch the gamified user data
  const userDoc = await User.findOne({ email: session.user.email }).lean()

  // 2. Fetch the stashed collections
  const userCollectionsDocs = await UserCollection.find({ userId: userDoc?._id })
    .populate("collectionId", "title description")
    .sort({ createdAt: -1 })
    .lean()

  // 3. THE FIX: Sanitize EVERYTHING 🚀
  // We stringify/parse the session to flatten that 'id: { buffer: ... }' into a simple string
  const plainSession = JSON.parse(JSON.stringify(session))
  const plainUser = JSON.parse(JSON.stringify(userDoc))
  const plainCollections = JSON.parse(JSON.stringify(userCollectionsDocs))

  return (
    <ProfileClient 
      session={plainSession} 
      user={plainUser} 
      userCollections={plainCollections} 
    />
  )
}