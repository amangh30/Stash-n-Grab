"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CollectionCard({ collection, user, savedIds, setUserResources }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSave = async (resourceId: string) => {
    if (!user) return alert("Login first! 🚀")
    setLoadingId(resourceId)
    try {
      const res = await fetch("/api/resource/save", {
        method: "POST",
        body: JSON.stringify({ resourceId }),
      })
      const data = await res.json()
      setUserResources((prev: any) => [data, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <motion.div
      layout
      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-shadow hover:shadow-2xl hover:shadow-purple-500/5"
    >
      {/* 1. Header Area */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-500/20">
              {collection.sections?.length || 0} Sections
            </span>
            <span className="text-gray-400 text-xs font-medium">
              by {collection.createdBy?.name || "Community"}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors tracking-tight">
            {collection.title}
          </h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
            {collection.description}
          </p>
        </div>

        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all"
        >
          ▼
        </motion.div>
      </div>

      {/* 2. Nested Content Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 px-8 pb-8"
          >
            {collection.sections?.map((section: any, sIdx: number) => (
              <div key={section._id} className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {sIdx + 1}
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    {section.title}
                  </h4>
                </div>

                {/* Resources within Section */}
                <div className="grid gap-3 pl-9">
                  {section.resources?.map((res: any) => {
                    const isSaved = savedIds.includes(res._id.toString())
                    return (
                      <div 
                        key={res._id}
                        className="group/item flex items-center justify-between p-4 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {res.title}
                          </span>
                          <a 
                            href={res.link} 
                            target="_blank" 
                            className="text-[10px] text-purple-600 hover:underline flex items-center gap-1"
                          >
                            Visit Resource ↗
                          </a>
                        </div>

                        {isSaved ? (
                          <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold rounded-lg border border-green-500/20">
                            Stashed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSave(res._id)}
                            disabled={loadingId === res._id}
                            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-lg hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {loadingId === res._id ? "..." : "Grab"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}