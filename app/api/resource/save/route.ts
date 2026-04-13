import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserResource from "@/models/UserResource"
// 🔥 Import the Resource model so Mongoose knows how to populate it
import Resource from "@/models/Resource" 

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { resourceId } = await req.json()

  // 1. Check if it already exists
  let userResource = await UserResource.findOne({
    userId: session.user.id,
    resourceId,
  }).populate("resourceId") // 🔥 Populate here too for consistency

  if (userResource) {
    return NextResponse.json(userResource)
  }

  // 2. Create the new link
  const newUserResource = await UserResource.create({
    userId: session.user.id,
    resourceId,
  })

  // 🔥 3. THE FIX: Populate the resourceId before returning
  // This turns the resourceId string into the full object { title, description, link... }
  const populatedResource = await newUserResource.populate("resourceId")

  return NextResponse.json(populatedResource)
}