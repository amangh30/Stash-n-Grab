import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { title, description, sections } = await req.json()

  try {
    // 1. Create the Collection Root
    const newCollection = await Collection.create({
      title,
      description,
      createdBy: session.user.id
    })

    const sectionIds = []

    // 2. Loop through Sections
    if (sections && sections.length > 0) {
      for (const sectionData of sections) {
        const newSection = await Section.create({
          title: sectionData.title,
          collectionId: newCollection._id
        })

        sectionIds.push(newSection._id)
        const resourceIds = []

        // 3. Loop through Resources inside this Section
        if (sectionData.resources && sectionData.resources.length > 0) {
          for (const resData of sectionData.resources) {
            const newResource = await Resource.create({
              ...resData,
              sectionId: newSection._id,
              createdBy: session.user.id
            })
            resourceIds.push(newResource._id)
          }
        }

        // Update Section with its Resource IDs
        newSection.resources = resourceIds
        await newSection.save()
      }
    }

    // 4. Update Collection with its Section IDs
    newCollection.sections = sectionIds
    await newCollection.save()

    // 5. Return the fully populated tree so the UI can render it instantly
    const fullTree = await Collection.findById(newCollection._id)
      .populate({
        path: 'sections',
        populate: { path: 'resources' }
      })

    return NextResponse.json(fullTree)
  } catch (err: any) {
    console.error("Deep Create Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}