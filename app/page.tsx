import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { connectDB } from "@/lib/mongodb"
import Resource from "@/models/Resource"
import UserResource from "@/models/UserResource"

import AnimatedBackground from "./component/AnimatedBackground"
import HomeClient from "./component/HomeClient"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  await connectDB()



  const user = session
    ? {
        id: session.user.id?.toString(),
        name: session.user.name,
        image: session.user.image,
      }
    : null

  const resources = await Resource.find()
    .populate("createdBy", "name image")
    .sort({ createdAt: -1 })

  let userResources: any[] = []

  if (session) {
    userResources = await UserResource.find({
      userId: session.user.id,
    }).populate("resourceId")
  }

    const savedIds = userResources.map(
    (item: any) => item.resourceId._id.toString()
  )

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f] transition-colors duration-500">
      
      <AnimatedBackground />

      {/* NAV */}
      <nav className="relative z-20 px-6 py-6 flex justify-end items-center max-w-6xl mx-auto">
        {!session ? (
          <Link 
            href="/login"
            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
              Welcome back, {session.user?.name?.split(" ")[0] || "Explorer"} 👋
            </span>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto">
        
      <HomeClient
        user={user}
        resources={JSON.parse(JSON.stringify(resources))}
        userResources={JSON.parse(JSON.stringify(userResources))}
        savedIds={savedIds}
      />

      </div>
    </div>
  )
}