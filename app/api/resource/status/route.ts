import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { resourceId, status } = await req.json()

    if (!resourceId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 🔥 Update or create the progress record
    const updated = await UserResource.findOneAndUpdate(
      { 
        userId: session.user.id, 
        resourceId: resourceId 
      },
      { 
        status, 
        progress: status === "completed" ? 100 : 0,
        completedAt: status === "completed" ? new Date() : null 
      },
      { new: true, upsert: true }
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Status Update Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}