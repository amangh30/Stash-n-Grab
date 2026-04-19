"use client"

import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { useRouter } from "next/navigation"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
}

export default function CollectionList({ 
  collections = [], 
  user, 
  savedCollectionIds = [], 
  setUserCollections 
}: any) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleGrab = async (collectionId: string) => {
    if (!user) return alert("Please sign in to stash this path! 🚀")
    if (savedCollectionIds.includes(collectionId)) return

    setLoadingId(collectionId)
    try {
      const res = await fetch("/api/collections/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId }),
      })

      if (!res.ok) throw new Error("Failed to stash")
      const data = await res.json()

      // 🔥 Update the Active Paths on Home instantly
      setUserCollections((prev: any) => [data.userCollection, ...prev])
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {collections.map((col: any) => {
        const id = col._id.toString()
        const isSaved = savedCollectionIds.includes(id)
        const isSaving = loadingId === id
        
        // Calculate total resources count for the badge
        const resourceCount = col.sections?.reduce(
          (acc: number, sec: any) => acc + (sec.resources?.length || 0), 0
        ) || 0

        return (
          <motion.div
            key={id}
            variants={itemVariants}
            layout
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-2xl shadow-inner">
                  📁
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 rounded-lg border border-slate-200 dark:border-white/10">
                  {resourceCount} Resources
                </span>
              </div>

              <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors tracking-tight">
                {col.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                {col.description}
              </p>

              <div className="flex items-center gap-2 mt-6">
                <img 
                  src={col.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${col.createdBy?.name}`} 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  alt="" 
                />
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500">
                  By {col.createdBy?.name || "Community"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <button
                onClick={() => router.push(`/collection/${id}`)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
              >
                View Path
              </button>

              {isSaved ? (
                <div className="flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 rounded-xl border border-green-500/20">
                  Stashed ✓
                </div>
              ) : (
                <button
                  onClick={() => handleGrab(id)}
                  disabled={isSaving}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "..." : "Grab"}
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}