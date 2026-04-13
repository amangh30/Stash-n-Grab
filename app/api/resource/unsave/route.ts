import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"
import Resource from "@/models/Resource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { resourceId } = await req.json()

  // delete from user resources
  await UserResource.findOneAndDelete({
    userId: session.user.id,
    resourceId,
  })

  // decrement saves count
  await Resource.findByIdAndUpdate(resourceId, {
    $inc: { saves: -1 }
  })

  return NextResponse.json({ success: true })
}