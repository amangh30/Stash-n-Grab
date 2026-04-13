"use client"

import { useState, useMemo, useEffect } from "react"
import CreateResource from "@/components/CreateResource"
import ResourceList from "./ResourceList"
import MyResources from "./MyResources"
import SearchBar from "./SearchBar"
import Leaderboard from "./Leaderboard" // 🔥 Updated to handle modal logic
import { useRouter } from "next/navigation"

export default function HomeClient({ 
  user, 
  resources: initialResources, 
  userResources: initialUserResources 
}: any) {
  const [open, setOpen] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false) // 🔥 State for leaderboard

  const [resources, setResources] = useState(initialResources)
  const [userResources, setUserResources] = useState(initialUserResources)

  const router = useRouter() // 🔥 Initialize router


  // 🔥 1. Sync local state if server props change (important for "coming back")
  useEffect(() => {
    setResources(initialResources)
    setUserResources(initialUserResources)
  }, [initialResources, initialUserResources])

  const handleCreateSuccess = (newResource: any) => {
    // 🔥 2. Instant UI Update (The "Fast" part)
    setResources((prev: any) => [newResource, ...prev])
    
    const newUserRes = {
      _id: `temp-${Date.now()}`,
      resourceId: newResource,
      status: "not_started",
      progress: 0
    }
    setUserResources((prev: any) => [newUserRes, ...prev])

    // 🔥 3. Background Sync (The "Permanent" part)
    // This tells Next.js to re-run the Server Component (HomePage) 
    // and refresh the props without a hard reload.
    router.refresh()
  }

  const savedIds = useMemo(() => {
    if (!userResources) return []
    return userResources
      .filter((item: any) => item && item.resourceId && item.resourceId._id)
      .map((item: any) => item.resourceId._id.toString())
  }, [userResources])


  return (
    <div className="flex flex-col gap-10">
      
      {/* 1. Header Section */}
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

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
          {/* 🔥 Leaderboard Toggle Button */}
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="px-6 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 font-semibold hover:bg-slate-100 dark:hover:bg-white/20 transition-all shadow-sm active:scale-95"
          >
            🏆 Rankings
          </button>

          {user && (
            <button 
              onClick={() => setOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95"
            >
              + Add Resource
            </button>
          )}
        </div>
      </div>

      {/* 2. Search Section */}
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
        <SearchBar />
      </div>

      {/* 3. Content Sections */}
      <div className="flex flex-col gap-12 mt-4">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌍</span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Explore Resources</h2>
          </div>
          <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <ResourceList resources={resources} user={user} savedIds={savedIds} setUserResources={setUserResources} />
          </div>
        </section>

        {user && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">My Resources</h2>
            </div>
            <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <MyResources userResources={userResources} setUserResources={setUserResources} />
            </div>
          </section>
        )}
      </div>

      {/* 4. Modals */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      {open && (
        <CreateResource onClose={() => setOpen(false)} onSuccess={handleCreateSuccess} />
      )}
    </div>
  )
}