"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import CollectionList from "./CollectionList" 
import MyCollections from "./MyCollections"
import SearchBar from "./SearchBar"
import Leaderboard from "./Leaderboard"

export default function HomeClient({ 
  user, 
  collections: initialCollections = [], 
  userCollections: initialUserCollections = [] 
}: any) {
  const router = useRouter()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // 1. Core Data State
  const [localCollections, setLocalCollections] = useState(initialCollections)
  const [localUserCollections, setLocalUserCollections] = useState(initialUserCollections)

  // 2. Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  // 3. Sync initial props
  useEffect(() => {
    setLocalCollections(initialCollections)
    setLocalUserCollections(initialUserCollections)
  }, [initialCollections, initialUserCollections])

  // 4. Handle Search Debounce (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 5. Fetch Logic for Search & Pagination
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/collections?search=${encodeURIComponent(debouncedQuery)}&page=${page}`
        )
        const data = await res.json()

        if (page === 1) {
          setLocalCollections(data.collections || [])
        } else {
          setLocalCollections((prev: any) => [...prev, ...(data.collections || [])])
        }
        setHasMore(data.hasMore)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    // Skip fetch on first mount if we already have initial server data
    if (page === 1 && !debouncedQuery && localCollections.length === initialCollections.length) {
      return
    }
    
    fetchCollections()
  }, [page, debouncedQuery])

  // Reset page when user changes the search query
  useEffect(() => {
    setPage(1)
  }, [debouncedQuery])

  // 6. Intersection Observer (Infinite Scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  // 7. Memoized ID list for "Stashed" check
  const savedCollectionIds = useMemo(() => {
    if (!localUserCollections || !Array.isArray(localUserCollections)) return []
    return localUserCollections
      .filter((item: any) => item?.collectionId?._id)
      .map((item: any) => item.collectionId._id.toString())
  }, [localUserCollections])

  return (
    <div className="flex flex-col gap-12">
      
      {/* 1. Header Area */}
      <div className="text-center md:text-left mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            Stash-N-Grab
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-400">
          Search, discover, and manage your digital resources in one place.
        </p>

        <div className="flex gap-4 py-6 justify-center md:justify-start">
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
          <SearchBar 
            query={searchQuery} 
            setQuery={setSearchQuery} 
            isLoading={loading} 
          />
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Explore Library</h2>
          </div>
          
          <CollectionList 
            collections={localCollections} 
            user={user} 
            savedCollectionIds={savedCollectionIds} 
            setUserCollections={setLocalUserCollections} 
          />

          {/* INFINITE SCROLL SENTINEL */}
          <div ref={observerTarget} className="w-full py-10 flex justify-center">
            {loading && (
              <div className="flex gap-2 items-center text-purple-500 font-bold animate-pulse">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                SYNCING DATA...
              </div>
            )}
            {!hasMore && localCollections.length > 0 && (
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                You've reached the end of the vault.
              </p>
            )}
          </div>
        </section>
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  )
}