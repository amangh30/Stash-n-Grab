"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import CollectionList from "./CollectionList" // 🔥 New Component
import MyResources from "./MyResources"
import SearchBar from "./SearchBar"
import Leaderboard from "./Leaderboard"

export default function HomeClient({ 
  user, 
  collections: initialCollections, // 🔥 Swapped resources for collections
  userResources: initialUserResources 
}: any) {
  const router = useRouter()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // 🔥 State for Collections
  const [collections, setCollections] = useState(initialCollections)
  const [userResources, setUserResources] = useState(initialUserResources)

  // Sync state with server props
  useEffect(() => {
    setCollections(initialCollections)
    setUserResources(initialUserResources)
  }, [initialCollections, initialUserResources])

  // Derive savedIds from userResources to pass down to children
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
          Discover structured knowledge paths built by the community.
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="px-6 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 font-semibold hover:bg-slate-100 dark:hover:bg-white/20 transition-all shadow-sm active:scale-95"
          >
            🏆 Rankings
          </button>

          {user && (
            <button 
              onClick={() => router.push('/create-collection')}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95"
            >
              + Create Collection
            </button>
          )}
        </div>
      </div>

      {/* 2. Search Section */}
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
        <SearchBar />
      </div>

      {/* 3. Content Sections */}
      <div className="flex flex-col gap-16 mt-4">
        
        {/* Explore Collections */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌍</span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Explore Collections</h2>
          </div>
          
          {/* 🔥 The New Collection Grid */}
          <CollectionList 
            collections={collections} 
            user={user} 
            savedIds={savedIds} 
            setUserResources={setUserResources} 
          />
        </section>

        {/* My Personal Stash (Resources) */}
        {user && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">My Stash</h2>
            </div>
            <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <MyResources userResources={userResources} setUserResources={setUserResources} />
            </div>
          </section>
        )}
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  )
}