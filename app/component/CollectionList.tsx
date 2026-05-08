"use client"

import { useState } from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// --- Animation Physics Constants ---
const SOFT_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }
const ENTRANCE_SPRING = { type: "spring", stiffness: 100, damping: 20, mass: 0.5 }

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1 
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: ENTRANCE_SPRING
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
    if (!user) return // Replace with a custom toast if possible
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
      setUserCollections((prev: any) => [data.userCollection, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4"
    >
      {collections.map((col: any) => {
        const id = col._id.toString()
        const isSaved = savedCollectionIds.includes(id)
        const isSaving = loadingId === id
        
        const resourceCount = col.sections?.reduce(
          (acc: number, sec: any) => acc + (sec.resources?.length || 0), 0
        ) || 0

        return (
          <motion.div
            key={id}
            variants={itemVariants}
            layout // Smoothly animates when list order changes
            whileHover={{ 
              y: -8, 
              transition: SOFT_SPRING 
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col justify-between overflow-hidden p-8 rounded-[2.5rem] bg-white/60 dark:bg-[#12121a] backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-colors duration-500 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10"
          >
            {/* Dynamic Background Glow */}
            <motion.div 
              className="absolute -right-16 -top-16 w-48 h-48 bg-purple-600/10 dark:bg-purple-500/15 rounded-full blur-[60px] pointer-events-none"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-2xl shadow-inner"
                >
                  📁
                </motion.div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-purple-400 rounded-lg border border-slate-200 dark:border-white/10">
                    {resourceCount} Resources
                  </span>
                </div>
              </div>

              <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-tight duration-300">
                {col.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed opacity-80">
                {col.description}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <div className="relative">
                  <img 
                    src={col.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${col.createdBy?.name}`} 
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-white/10 shadow-sm" 
                    alt={col.createdBy?.name} 
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white dark:border-[#12121a] rounded-full" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tighter">
                  Curated by <span className="text-slate-700 dark:text-gray-300">{col.createdBy?.name || "Community"}</span>
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <button
                onClick={() => router.push(`/collection/${id}`)}
                className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300"
              >
                View Path
              </button>

              <div className="flex-1 h-[46px] relative">
                <AnimatePresence mode="wait">
                  {isSaved ? (
                    <motion.div
                      key="stashed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                    >
                      Stashed ✓
                    </motion.div>
                  ) : (
                    <motion.button
                      key="grab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => handleGrab(id)}
                      disabled={isSaving}
                      className="absolute inset-0 w-full py-3 text-[11px] font-black uppercase tracking-widest bg-purple-600 text-white rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? (
                         <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mx-auto"
                         />
                      ) : "Grab Path"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}