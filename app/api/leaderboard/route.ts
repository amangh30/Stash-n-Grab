import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  const session = await getServerSession(authOptions)
  await connectDB()

  // 1. Get Top 10
  const topUsers = await User.find()
    .select("name image xp level streak")
    .sort({ xp: -1 })
    .limit(10)
    .lean()

  let currentUserStats = null

  // 2. If logged in, calculate current user's rank
  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email }).select("xp name image level streak").lean()
    
    if (user) {
      // Rank is simply: (count of users with more XP) + 1
      const rank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1
      currentUserStats = { ...user, rank }
    }
  }

  return NextResponse.json({
    top10: topUsers,
    currentUser: currentUserStats
  })
}