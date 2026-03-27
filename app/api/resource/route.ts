import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Resource from "@/models/Resource"

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

  return NextResponse.json(resource)
}

export async function GET() {
  await connectDB()

  const resources = await Resource.find()
    .populate("createdBy", "name image")
    .sort({ createdAt: -1 })

  return NextResponse.json(resources)
}