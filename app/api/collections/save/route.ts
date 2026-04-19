import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import UserCollection from "@/models/UserCollection"
import UserResource from "@/models/UserResource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { collectionId } = await req.json()

  try {
    // 1. Fetch the collection with its sections and resources
    const targetCollection = await Collection.findById(collectionId).populate({
      path: 'sections',
      populate: { path: 'resources' }
    })

    if (!targetCollection) return NextResponse.json({ error: "Collection not found" }, { status: 404 })

    // 2. Create the UserCollection (The "Folder" in the vault)
    const userCol = await UserCollection.create({
      userId: session.user.id,
      collectionId
    })

    // 3. Extract all Resource IDs from all sections
    const allResources = targetCollection.sections.flatMap((sec: any) => sec.resources)

    // 4. Mass-create UserResource entries for the progress tracking
    const resourceTrackers = allResources.map((res: any) => ({
      userId: session.user.id,
      resourceId: res._id,
      status: "not_started",
      progress: 0,
      saved: true // Keeps your existing logic compatible
    }))

    // insertMany is much faster for bulk operations
    await UserResource.insertMany(resourceTrackers, { ordered: false }).catch(err => {
      // Ignore errors for resources the user might have already saved individually
      console.log("Some resources were already in the vault.")
    })

    return NextResponse.json({ 
      message: "Collection stashed successfully!",
      userCollection: userCol 
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}