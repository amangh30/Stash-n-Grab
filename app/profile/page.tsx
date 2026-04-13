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

  // 1. Fetch data using .lean() to get faster, lighter objects
  const userDoc = await User.findOne({ email: session.user.email }).lean()
  
  const userResourcesDocs = userDoc 
    ? await UserResource.find({ userId: userDoc._id })
        .populate({
          path: "resourceId",
          populate: {
            path: "createdBy",
            select: "name image",
          },
        })
        .lean()
    : [];

  // 2. THE FIX: The Serialization Nuclear Option 🚀
  // This recursively converts every _id (including nested createdBy._id) to a string
  const user = JSON.parse(JSON.stringify(userDoc))
  const userResources = JSON.parse(JSON.stringify(userResourcesDocs))

  // 3. Ensure session is also a plain object
  const plainSession = JSON.parse(JSON.stringify(session))

  return (
    <ProfileClient
      session={plainSession}
      user={user}
      userResources={userResources}
    />
  )
}