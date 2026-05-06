import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserSection from "@/models/UserSection"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { sectionId, passed } = await req.json()

  if (!passed) return NextResponse.json({ message: "Exam failed. Try again!" })

  const progress = await UserSection.findOneAndUpdate(
    { userId: session.user.id, sectionId },
    { examPassed: true },
    { new: true, upsert: true }
  )

  return NextResponse.json(progress)
}