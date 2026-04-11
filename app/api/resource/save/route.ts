import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { resourceId } = await req.json()

  const existing = await UserResource.findOne({
    userId: session.user.id,
    resourceId,
  })

  if (existing) {
    return NextResponse.json(existing)
  }

  const userResource = await UserResource.create({
    userId: session.user.id,
    resourceId,
  })

  return NextResponse.json(userResource)
}