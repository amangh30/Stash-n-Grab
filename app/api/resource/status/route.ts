import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import UserResource from "@/models/UserResource"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { resourceId, status } = await req.json()
  await connectDB()

  // 1. Update the Resource Status
  const updatedResource = await UserResource.findOneAndUpdate(
    { userId: session.user.id, resourceId },
    { status, updatedAt: new Date() },
    { upsert: true, new: true }
  )

  // 2. STREAK LOGIC: Only trigger if marking as "completed"
  if (status === "completed") {
    const user = await User.findById(session.user.id)
    
    if (user) {
      const now = new Date()
      const lastActive = user.lastActive ? new Date(user.lastActive) : null

      // Normalize dates to "start of day" for accurate comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const lastActiveDay = lastActive 
        ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime() 
        : 0

      const oneDayInMs = 24 * 60 * 60 * 1000
      const diff = today - lastActiveDay

      if (diff === 0) {
        // Already active today, do nothing to the streak
      } else if (diff === oneDayInMs) {
        // Yesterday was the last activity - Streak continues!
        user.streak += 1
      } else {
        // Missed a day or first time - Reset to 1
        user.streak = 1
      }

      user.lastActive = now
      await user.save()
    }
  }

  return NextResponse.json(updatedResource)
}