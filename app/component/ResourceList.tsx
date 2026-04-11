"use client"

import { motion, Variants } from "framer-motion"
import { useState } from "react"

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
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function ResourceList({ resources, user, savedIds }: any) {

  const [loadingId, setLoadingId] = useState<string | null>(null)

  // ✅ initialize from server
  const [savedSet, setSavedSet] = useState<Set<string>>(
    new Set(savedIds || [])
  )

  const handleSave = async (resourceId: string) => {
    if (!user) {
      alert("Login first")
      return
    }

    if (savedSet.has(resourceId)) return

    setLoadingId(resourceId)

    try {
      const res = await fetch("/api/resource/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resourceId }),
      })

      if (!res.ok) throw new Error("Failed")

      // ✅ update UI instantly
      setSavedSet((prev) => new Set(prev).add(resourceId))

    } catch (err) {
      console.error(err)
      alert("Something went wrong")
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
        const id = String(item._id)

        const isSaved = savedSet.has(id)

        return (
          <motion.div
            key={id}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                📚
              </div>

              <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
                {item.description}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                by {item.createdBy?.name || "Unknown"}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex items-center justify-between">
              
              <a
                href={item.link}
                target="_blank"
                className="text-sm text-purple-600 hover:underline"
              >
                Open
              </a>

              {isSaved ? (
                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg font-medium">
                  Saved ✓
                </span>
              ) : (
                <button
                  onClick={() => handleSave(id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  {loadingId === id ? "Saving..." : "Save"}
                </button>
              )}

            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}