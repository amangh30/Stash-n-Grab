import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  await connectDB()

  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const oldLevel = Math.floor((user.xp || 0) / 100) + 1
  user.xp = (user.xp || 0) + amount
  const newLevel = Math.floor(user.xp / 100) + 1
  
  if (newLevel > oldLevel) {
    user.level = newLevel
  }

  await user.save()

  return NextResponse.json({ 
    xp: user.xp, 
    level: user.level,
    leveledUp: newLevel > oldLevel 
  })
}