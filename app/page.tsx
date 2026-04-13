import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Resource from "@/models/Resource"
import UserResource from "@/models/UserResource"

import AnimatedBackground from "./component/AnimatedBackground"
import HomeClient from "./component/HomeClient"

// HomePage.tsx
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  const user = session ? {
    id: session.user.id?.toString(),
    name: session.user.name,
    image: session.user.image,
  } : null

  const resources = await Resource.find().populate("createdBy", "name image").sort({ createdAt: -1 }).lean()

let userResourcesDocs: unknown[] = [];
  if (session) {
    // 🔥 Ensure we use the correct ID from the session
    userResourcesDocs = await UserResource.find({ userId: session.user.id }).populate("resourceId").lean()
  }

  const resourcesData = JSON.parse(JSON.stringify(resources))
  const userResourcesData = JSON.parse(JSON.stringify(userResourcesDocs))

  // 🔥 Generate savedIds from the CLEANED data
  const savedIds = userResourcesData
    .filter((ur: any) => ur.resourceId)
    .map((ur: any) => ur.resourceId._id.toString())

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f]">
      <AnimatedBackground />
      {/* ... Nav ... */}
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto">
        <HomeClient
          user={user}
          resources={resourcesData}
          userResources={userResourcesData}
          savedIds={savedIds}
        />
      </div>
    </div>
  )
}