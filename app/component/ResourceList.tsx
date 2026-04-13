"use client"

import { useState } from "react"
import { motion, Variants } from "framer-motion"

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

export default function ResourceList({ 
  resources, 
  user, 
  savedIds = [], 
  setUserResources 
}: any) {

  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSave = async (resourceId: string, item: any) => {
    if (!user) {
      alert("Please sign in to save resources! 🚀")
      return
    }

    if (savedIds.includes(resourceId)) return

    setLoadingId(resourceId)

    try {
      const res = await fetch("/api/resource/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      })

      if (!res.ok) throw new Error("Failed to save")

      const savedItem = await res.json()

      // 🔥 Update parent state (MyResources will react instantly)
      setUserResources((prev: any) => [savedItem, ...prev])

    } catch (err) {
      console.error(err)
      alert("Something went wrong while saving.")
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
      {resources.map((item: any) => {
        const id = item._id.toString()
        const isSaved = savedIds.includes(id)
        const isSaving = loadingId === id

        return (
          <motion.div
            key={id}
            variants={itemVariants}
            layout
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all pointer-events-none" />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 text-xl">
                📚
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <img 
                  src={item.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.createdBy?.name}`} 
                  className="w-5 h-5 rounded-full" 
                  alt="" 
                />
                <p className="text-xs font-medium text-slate-400 dark:text-gray-500">
                  by {item.createdBy?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex items-center justify-between relative z-10">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors flex items-center gap-1"
              >
                Open
              </a>

              {isSaved ? (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-4 py-1.5 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-xl font-bold border border-green-200 dark:border-green-500/30 shadow-sm"
                >
                  Saved ✓
                </motion.span>
              ) : (
                <button
                  onClick={() => handleSave(id, item)}
                  disabled={isSaving}
                  className="px-5 py-1.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "..." : "Save"}
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}