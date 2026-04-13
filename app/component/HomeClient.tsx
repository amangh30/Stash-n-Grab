"use client"

import { useState, useMemo } from "react"
import CreateResource from "@/components/CreateResource"
import ResourceList from "./ResourceList"
import MyResources from "./MyResources"
import SearchBar from "./SearchBar"

export default function HomeClient({ 
  user, 
  resources: initialResources, 
  userResources: initialUserResources 
}: any) {
  const [open, setOpen] = useState(false)

  // 🔥 1. Lift State: Manage lists locally for instant reactivity
  const [resources, setResources] = useState(initialResources)
  const [userResources, setUserResources] = useState(initialUserResources)

  // 🔥 2. Dynamic savedIds: This re-calculates instantly whenever userResources changes
  // Added a strict guard to prevent the "reading toString of undefined" error
  const savedIds = useMemo(() => {
    if (!userResources) return []
    return userResources
      .filter((item: any) => item && item.resourceId && item.resourceId._id)
      .map((item: any) => item.resourceId._id.toString())
  }, [userResources])

  // 🔥 3. Handle Instant Creation
  const handleCreateSuccess = (newResource: any) => {
    // Add to the global explore list
    setResources((prev: any) => [newResource, ...prev])
    
    // Also add to user stash instantly as "not_started"
    // Assuming your API returns the populated resource object
    const newUserRes = {
      _id: `temp-${Date.now()}`, // Temporary ID for React key stability
      resourceId: newResource,
      status: "not_started",
      progress: 0
    }
    setUserResources((prev: any) => [newUserRes, ...prev])
  }

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
        
        {user && (
          <button 
            onClick={() => setOpen(true)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95"
          >
            + Add Resource
          </button>
        )}
      </div>

      {/* 2. Search Section */}
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
        <SearchBar />
      </div>

      {/* 3. Content Sections */}
      <div className="flex flex-col gap-12 mt-4">
        
        {/* Explore Resources */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌍</span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Explore Resources</h2>
          </div>
          
          <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <ResourceList
                resources={resources}
                user={user}
                savedIds={savedIds}
                setUserResources={setUserResources} // 🔥 Pass the setter for instant saving
                />
          </div>
        </section>

        {/* My Resources (Conditional) */}
        {user && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">My Resources</h2>
            </div>
            
            <div className="bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <MyResources 
                userResources={userResources} 
                setUserResources={setUserResources} // 🔥 Pass the setter for instant progress/unsave
              />
            </div>
          </section>
        )}
        
      </div>

      {/* 4. Modal Overlay */}
      {open && (
        <CreateResource 
            onClose={() => setOpen(false)} 
            onSuccess={handleCreateSuccess} // 🔥 Pass the creation handler
        />
      )}
    </div>
  )
}