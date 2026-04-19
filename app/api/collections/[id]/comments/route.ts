import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Comment from "@/models/Comment"

export async function POST(req: Request, { params }: any) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { text } = await req.json()

  await connectDB()
  const comment = await Comment.create({
    collectionId: id,
    userId: session.user.id,
    text
  })

  const populated = await comment.populate("userId", "name image")
  return NextResponse.json(populated)
}

export async function GET(req: Request, { params }: any) {
  const { id } = await params
  await connectDB()
  const comments = await Comment.find({ collectionId: id })
    .populate("userId", "name image")
    .sort({ createdAt: -1 })
  
  return NextResponse.json(comments)
}