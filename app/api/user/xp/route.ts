import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import UserResource from "@/models/UserResource" // 🔥 Need this for "Consistent Learner" check
import { checkAchievements } from "@/lib/achievements" // Adjust path as needed

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  await connectDB()

  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // 1. Update XP and Leveling
  const oldLevel = Math.floor((user.xp || 0) / 100) + 1
  user.xp = (user.xp || 0) + amount
  const newLevel = Math.floor(user.xp / 100) + 1
  if (newLevel > oldLevel) user.level = newLevel

  // 2. 🔥 ACHIEVEMENT CHECK
  // Fetch total completed resources for the "Consistent Learner" criteria
  const completedCount = await UserResource.countDocuments({ 
    userId: user._id, 
    status: "completed" 
  })

  // This function modifies the 'user' object and returns what was JUST earned
  const newlyUnlocked = await checkAchievements(user, completedCount)

  await user.save()

  return NextResponse.json({ 
    xp: user.xp, 
    level: user.level,
    leveledUp: newLevel > oldLevel,
    newlyUnlocked // 🔥 Send this back to the UI
  })
}