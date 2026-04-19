"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CollectionCard({ 
  collection, 
  user, 
  savedCollectionIds = [], // 🔥 Destructure correctly with default
  setUserCollections 
}: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  // 🔥 Bulletproof Check: Use optional chaining ?. before .includes
  const isSaved = savedCollectionIds?.includes(collection._id.toString())

  const handleGrabCollection = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    if (!user) return alert("Login to stash this collection! 🔒")
    
    setLoading(true)
    try {
      const res = await fetch("/api/collections/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: collection._id })
      })
      const data = await res.json()
      
      // Update the local state in HomeClient instantly
      setUserCollections((prev: any) => [data.userCollection, ...prev])
    } catch (err) {
      console.error("Grab failed", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      layout
      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
      >
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
            {collection.title}
          </h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {collection.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isSaved ? (
            <span className="px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-xl border border-green-500/20">
              Stashed ✓
            </span>
          ) : (
            <button
              onClick={handleGrabCollection}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : "Grab Path"}
            </button>
          )}
          
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>▼</motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-white/5 px-8 pb-8"
          >
            {/* Render your sections/resources here */}
            {collection.sections?.map((section: any) => (
              <div key={section._id} className="mt-6">
                <p className="text-[10px] font-black uppercase text-purple-500 mb-2">{section.title}</p>
                {section.resources?.map((res: any) => (
                  <div key={res._id} className="text-sm py-2 dark:text-gray-300">
                    • {res.title}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}