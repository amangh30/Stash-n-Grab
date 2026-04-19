"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import CollectionList from "./CollectionList" 
import MyCollections from "./MyCollections"
import SearchBar from "./SearchBar"
import Leaderboard from "./Leaderboard"

export default function HomeClient({ 
  user, 
  collections = [],      // 🔥 Default to empty array
  userCollections = []   // 🔥 Default to empty array
}: any) {
  const router = useRouter()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Local state for instant UI updates when grabbing
  const [localCollections, setLocalCollections] = useState(collections)
  const [localUserCollections, setLocalUserCollections] = useState(userCollections)

  useEffect(() => {
    setLocalCollections(collections)
    setLocalUserCollections(userCollections)
  }, [collections, userCollections])

  // 🔥 This generates the list of IDs for the "Grabbed" check
  const savedCollectionIds = useMemo(() => {
    if (!localUserCollections || !Array.isArray(localUserCollections)) return []
    return localUserCollections
      .filter((item: any) => item?.collectionId?._id)
      .map((item: any) => item.collectionId._id.toString())
  }, [localUserCollections])

  return (
    <div className="flex flex-col gap-12">
      
      {/* 1. Header Area */}
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

        <div className="flex gap-4 py-3">
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/20 transition-all active:scale-95"
          >
            🏆 Rankings
          </button>
          {user && (
            <button 
              onClick={() => router.push('/create-collection')}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95"
            >
              + Create Path
            </button>
          )}
        </div>
      </div>

      {/* 2. My Stashed Collections (Active Paths) */}
      {user && localUserCollections.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Active Paths</h2>
          </div>
          <MyCollections 
            userCollections={localUserCollections} 
            setUserCollections={setLocalUserCollections} 
          />
        </section>
      )}

      {/* 3. Explore Library */}
      <div className="space-y-10 pt-10 border-t border-slate-200 dark:border-white/5">
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-[2rem] shadow-sm">
          <SearchBar />
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Explore Library</h2>
          </div>
          
          <CollectionList 
            collections={collections} 
            user={user} 
            savedCollectionIds={savedCollectionIds} 
            setUserCollections={setLocalUserCollections} 
          />
        </section>
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  )
}