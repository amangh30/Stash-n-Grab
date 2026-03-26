import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import UserResource from "@/models/UserResource"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await connectDB()

  // Get user document
  const userDoc = await User.findOne({ email: session.user.email }).lean()
  
  // Convert user document to plain object
  const user = {
    ...userDoc,
    _id: userDoc._id.toString(),
    // Ensure no ObjectId remains in any nested fields
    id: userDoc._id.toString(), // Add this if your component expects an 'id' field
  }

  // Get user resources
  const userResourcesDocs = await UserResource.find({
    userId: user._id,
  })
    .populate("resourceId")
    .lean()

  // Convert user resources to plain objects
  const userResources = userResourcesDocs.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    userId: item.userId.toString(),
    resourceId: {
      ...item.resourceId,
      _id: item.resourceId._id.toString(),
      // Convert any other ObjectId fields in resourceId if needed
    }
  }))

  // Remove any MongoDB-specific fields from session if needed
  const plainSession = {
    ...session,
    user: {
      ...session.user,
      // Ensure no ObjectId is present in session.user
      id: session.user.id?.toString() || session.user.id,
    }
  }

  return (
    <ProfileClient
      session={plainSession}
      user={user}
      userResources={userResources}
    />
  )
}