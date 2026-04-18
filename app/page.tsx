import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Resource from "@/models/Resource"
import UserResource from "@/models/UserResource"

import AnimatedBackground from "./component/AnimatedBackground"
import HomeClient from "./component/HomeClient"
import Collection from "@/models/Collection"

// HomePage.tsx
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  // 1. Fetch Collections with DEEP Population
  const collectionsDocs = await Collection.find()
    .populate({
      path: 'sections',
      populate: {
        path: 'resources',
        model: 'Resource'
      }
    })
    .populate('createdBy', 'name image')
    .sort({ createdAt: -1 })
    .lean()

  // 2. Fetch User's personal stash (Resources they grabbed)
  let userResourcesDocs = []
  if (session?.user?.id) {
    userResourcesDocs = await UserResource.find({ userId: session.user.id })
      .populate('resourceId')
      .lean()
  }

  // 3. Clean the data for the Client (Removes Mongoose weirdness)
  const collections = JSON.parse(JSON.stringify(collectionsDocs))
  const userResources = JSON.parse(JSON.stringify(userResourcesDocs))

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f]">
      <AnimatedBackground />
      {/* ... Nav ... */}
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto">
        <HomeClient
          user={session?.user} 
        collections={collections} 
        userResources={userResources}
        />
      </div>
    </div>
  )
}