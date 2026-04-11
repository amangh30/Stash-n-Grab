import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Resource from "@/models/Resource"
import UserResource from "@/models/UserResource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()

  const resource = await Resource.create({
    title: body.title,
    description: body.description,
    link: body.link,
    tags: body.tags || [],
    createdBy: session.user.id,
  })

  await UserResource.create({
    userId: session.user.id,
    resourceId: resource._id,
    status: "not_started",
    progress: 0,
  })

  await Resource.findByIdAndUpdate(resource._id, {
    $inc: { saves: 1 }
  })

  return NextResponse.json(resource)
}

export async function GET() {
  await connectDB()

  const resources = await Resource.find()
    .populate("createdBy", "name image")
    .sort({ createdAt: -1 })

  return NextResponse.json(resources)
}