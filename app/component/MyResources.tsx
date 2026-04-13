"use client"

import { useState } from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"

// 1. Refined Animation Variants for a "Popping" feel
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 } // Faster stagger for snappiness
  }
}

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    transition: { duration: 0.2, ease: "easeOut" } 
  }
}

export default function MyResources({ userResources, setUserResources }: any) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [xpGain, setXpGain] = useState<number | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  const updateProgress = async (resourceId: string, progress: number, status: string) => {
    if (status === "completed") {
      const existing = userResources.find((i: any) => i.resourceId?._id?.toString() === resourceId)
      if (existing?.status === "completed") return
    }

    setLoadingId(resourceId)
    try {
      const res = await fetch("/api/resource/progress", {
        method: "POST",
        body: JSON.stringify({ resourceId, progress, status }),
      })
      const data = await res.json()
      setLoadingId(null)

      if (status === "completed") {
        setXpGain(50)
        if (data?.user?.level) setLevelUp(data.user.level)
        setTimeout(() => { setXpGain(null); setLevelUp(null); }, 2000)
      }

      setUserResources((prev: any) =>
        prev.map((item: any) => {
          if (item.resourceId?._id?.toString() === resourceId) {
            return { ...item, progress, status }
          }
          return item
        })
      )
    } catch (error) {
      console.error("Update failed", error)
      setLoadingId(null)
    }
  }

  const handleUnsave = async (resourceId: string) => {
    setLoadingId(resourceId)
    try {
      await fetch("/api/resource/unsave", {
        method: "POST",
        body: JSON.stringify({ resourceId }),
      })

      setUserResources((prev: any) =>
        prev.filter((item: any) => item.resourceId._id.toString() !== resourceId)
      )
    } catch (err) {
      console.error("Unsave failed", err)
    } finally {
      setLoadingId(null)
    }
  }

  if (!userResources || userResources.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 py-10 italic"
      >
        No resources yet. Your vault is empty! 🔒
      </motion.div>
    )
  }

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* 🔥 popLayout ensures exiting cards don't block the space during animation */}
        <AnimatePresence mode="popLayout">
          {userResources.map((item: any) => {
            if (!item?._id || !item?.resourceId?._id) return null;

            const res = item.resourceId;
            const id = res._id.toString();
            const itemKey = item._id.toString();
            const isUpdating = loadingId === id;

            return (
              <motion.div
                key={itemKey} 
                layout // 🔥 Animates the size and position changes
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                // 🔥 Physics-based layout transition (no more jumping!)
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-3xl bg-white/60 dark:bg-purple-900/10 backdrop-blur-md border border-slate-200 dark:border-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow relative overflow-hidden group"
              >
                {/* Background Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl group-hover:bg-purple-400/20 transition-all pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-lg shadow-inner">
                      {item.status === "completed" ? "✅" : "📚"}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-500/30">
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnsave(id)}
                    className="p-2 rounded-lg bg-red-500/5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                {/* Progress */}
                <div className="mt-6 relative z-10">
                  <div className="flex justify-between text-xs font-semibold mb-2 dark:text-gray-300">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      layout // 🔥 Animates the progress bar width increase smoothly
                      initial={false}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-6 relative z-10">
                  {item.progress < 100 && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateProgress(id, Math.min(item.progress + 20, 100), "in_progress")}
                      className="flex-1 text-xs font-bold py-2.5 px-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {isUpdating ? "..." : "+20%"}
                    </button>
                  )}

                  {item.status !== "completed" && (
                    <button
                      disabled={isUpdating}
                      onClick={() => updateProgress(id, 100, "completed")}
                      className="flex-[2] text-xs font-bold py-2.5 px-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isUpdating ? "Updating..." : "Mark Complete"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {xpGain && (
          <motion.div 
            key="xp-gain-popup"
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-10 right-10 z-[100] bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.5)] font-bold text-xl flex items-center gap-3 border border-white/20"
          >
            <span className="text-2xl">✨</span> +{xpGain} XP gained!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}