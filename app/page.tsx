import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

// Models
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"
import UserResource from "@/models/UserResource"

// Components
import AnimatedBackground from "./component/AnimatedBackground"
import HomeClient from "./component/HomeClient"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  // 1. Format User Object for Client
  const user = session ? {
    id: session.user.id?.toString(),
    name: session.user.name,
    image: session.user.image,
  } : null

  // 2. Fetch Collections with DEEP Population (The Core Change)
  // We populate sections, then inside sections we populate resources.
  const collectionsDocs = await Collection.find()
    .populate({
      path: 'sections',
      model: Section, // Explicitly tell Mongoose which model to use
      populate: {
        path: 'resources',
        model: Resource
      }
    })
    .populate("createdBy", "name image")
    .sort({ createdAt: -1 })
    .lean()

  // 3. Fetch User's Personal Stash
  let userResourcesDocs: any[] = []
  if (session) {
    userResourcesDocs = await UserResource.find({ userId: session.user.id })
      .populate("resourceId")
      .lean()
  }

  // 4. Serialization (Cleaning Mongoose Objects for Client)
  const collectionsData = JSON.parse(JSON.stringify(collectionsDocs))
  const userResourcesData = JSON.parse(JSON.stringify(userResourcesDocs))

  // 5. Generate savedIds (For the "Grabbed" check in the UI)
  const savedIds = userResourcesData
    .filter((ur: any) => ur.resourceId)
    .map((ur: any) => ur.resourceId._id.toString())

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f]">
      <AnimatedBackground />
      
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto">
        <HomeClient
          user={user}
          collections={collectionsData} // 🔥 Swapped 'resources' for 'collections'
          userResources={userResourcesData}
          savedIds={savedIds}
        />
      </div>
    </div>
  )
}