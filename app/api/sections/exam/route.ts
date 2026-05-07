// app/api/sections/exam/route.ts

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import UserSection from "@/models/UserSection"
import UserCollection from "@/models/UserCollection" // 🔥 Import this
import Section from "@/models/Section"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { sectionId, passed } = await req.json()

  if (!passed) return NextResponse.json({ message: "Exam failed" })

  // 1. Mark the specific section as passed
  const userSection = await UserSection.findOneAndUpdate(
    { userId: session.user.id, sectionId },
    { examPassed: true },
    { new: true, upsert: true }
  )

  // 2. 🔥 RECALCULATE TOTAL COLLECTION PROGRESS
  // Find the section to get the parent collectionId
  const sectionDoc = await Section.findById(sectionId);
  if (!sectionDoc) return NextResponse.json({ error: "Section not found" });

  const parentCollectionId = sectionDoc.collectionId;

  // Count total sections in this collection
  const totalSectionsCount = await Section.countDocuments({ collectionId: parentCollectionId });

  // Count how many exams the user has passed for THIS specific collection
  const allCollectionSections = await Section.find({ collectionId: parentCollectionId }).select('_id');
  const sectionIds = allCollectionSections.map(s => s._id);

  const passedCount = await UserSection.countDocuments({
    userId: session.user.id,
    sectionId: { $in: sectionIds },
    examPassed: true
  });

  // 3. Calculate Percentage
  const newProgress = Math.round((passedCount / totalSectionsCount) * 100);

  // 4. Update the UserCollection "Master" record
  await UserCollection.findOneAndUpdate(
    { userId: session.user.id, collectionId: parentCollectionId },
    { progress: newProgress },
    { upsert: true }
  );

  return NextResponse.json({ 
    userSection, 
    newProgress 
  });
}