import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import SearchBar from "./component/SearchBar"
import ResourceList from "./component/ResourceList"
import MyResources from "./component/MyResources"
import AnimatedBackground from "./component/AnimatedBackground"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b0b0f] transition-colors duration-500">
      
      {/* 1. Client-side Animations */}
      <AnimatedBackground />

      {/* 2. Top Navigation Bar */}
      <nav className="relative z-20 px-6 py-6 flex justify-end items-center max-w-6xl mx-auto">
        {!session ? (
          <Link 
            href="/login" // Make sure this matches your login page route!
            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
              Welcome back, {session.user?.name?.split(" ")[0] || "Explorer"} 👋
            </span>
            {/* You can drop a User Profile Dropdown or Sign Out button here later */}
          </div>
        )}
      </nav>

      {/* 3. Main Content */}
      <div className="relative z-10 px-4 md:px-10 pb-12 pt-2 max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              Stash-N-Grab
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-400">
            Search, discover, and manage your digital resources in one place.
          </p>
        </div>

        {/* Search Bar Wrapper */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
          <SearchBar />
        </div>

        {/* Content Grids */}
        <div className="flex flex-col gap-12 mt-4">
          
          {/* Explore Resources */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌍</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Explore Resources</h2>
            </div>
            
            <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <ResourceList />
            </div>
          </section>

          {/* My Resources (Protected) */}
          {session && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🔒</span>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">My Resources</h2>
              </div>
              
              <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
                <MyResources />
              </div>
            </section>
          )}
          
        </div>
      </div>
    </div>
  )
}