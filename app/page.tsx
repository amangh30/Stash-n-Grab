import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

// Models
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"
import UserCollection from "@/models/UserCollection" // 🔥 Make sure this exists!
import UserResource from "@/models/UserResource"

// Components
import AnimatedBackground from "./component/AnimatedBackground"
import HomeClient from "./component/HomeClient"
import Link from "next/link"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  await connectDB()

  const user = session ? {
    id: session.user.id?.toString(),
    name: session.user.name,
    image: session.user.image,
  } : null

  // 1. Fetch the Library (Collections -> Sections -> Resources)
  const collectionsDocs = await Collection.find()
    .populate({
      path: 'sections',
      model: Section,
      populate: {
        path: 'resources',
        model: Resource
      }
    })
    .populate("createdBy", "name image")
    .sort({ createdAt: -1 })
    .lean()

  // 2. Fetch User's Stashed Collections (The folders they "Grabbed")
  let userCollectionsDocs = []
  if (session) {
    userCollectionsDocs = await UserCollection.find({ userId: session.user.id })
      .populate({
        path: 'collectionId',
        populate: {
          path: 'sections',
          populate: { path: 'resources' }
        }
      })
      .lean()
  }

  // 3. Serialization
  const collectionsData = JSON.parse(JSON.stringify(collectionsDocs))
  const userCollectionsData = JSON.parse(JSON.stringify(userCollectionsDocs))

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f]">
      <AnimatedBackground />
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
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto">
        <HomeClient
          user={user}
          collections={collectionsData}
          userCollections={userCollectionsData} // 🔥 Name must match HomeClient destructuring
        />
      </div>
    </div>
  )
}