import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"
import User from "@/models/User"
import { checkAchievements } from "@/lib/achievements" // 🔥 Our modular utility

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const { resourceId, progress, status } = await req.json()

  // 1. Update the Resource Progress
  const userResource = await UserResource.findOneAndUpdate(
    {
      userId: session.user.id,
      resourceId,
    },
    {
      progress,
      status,
      ...(status === "completed" && { completedAt: new Date() }),
    },
    { new: true }
  )

  // 2. Fetch User Document
  let user = await User.findById(session.user.id)
  let newAchievements: string[] = []

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // 🔥 3. GAMIFICATION & ACHIEVEMENT LOGIC
  // Only trigger this when a resource is marked as "completed"
  if (status === "completed") {
    // A. Basic Stats
    user.xp += 50
    user.level = Math.floor(user.xp / 100) + 1
    user.lastActive = new Date()
    user.streak += 1

    // B. Calculate total completions for achievement checking
    const completedCount = await UserResource.countDocuments({
      userId: user._id,
      status: "completed"
    })

    // C. Check Achievements (Utility handles the logic & updates user.achievements array)
    newAchievements = await checkAchievements(user, completedCount)
  }

  // 4. Save the User (updates XP, Level, Streak, and newly earned Achievements)
  await user.save()

  // 5. Final Response
  return NextResponse.json({
    userResource,
    user,             // Includes updated XP and Level
    newAchievements   // Passed to frontend to trigger the "Ding" and Popup
  })
}