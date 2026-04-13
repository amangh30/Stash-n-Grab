import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"
import User from "@/models/User"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const { resourceId, progress, status } = await req.json()

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

  // Initialize user as null or fetch existing
  let user = await User.findById(session.user.id)

  // 🔥 GAMIFICATION LOGIC
  if (status === "completed" && user) {
    user.xp += 50
    user.level = Math.floor(user.xp / 100) + 1
    user.lastActive = new Date()
    user.streak += 1
    await user.save()
  }

  return NextResponse.json({
    userResource,
    user // Now user is always defined
  })
}