"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function MyCollections({ userCollections, setUserCollections }: any) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence mode="popLayout">
        {userCollections.map((item: any) => {
          const col = item.collectionId
          if (!col) return null

          return (
            <motion.div
              layout
              key={item._id}
              className="bg-white/60 dark:bg-purple-900/10 backdrop-blur-md border border-slate-200 dark:border-purple-500/20 rounded-[2rem] p-8 hover:shadow-2xl transition-all group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-xl">
                  {item.status === "completed" ? "✅" : "🚀"}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                    Your Progress
                  </span>
                  <p className="text-2xl font-black dark:text-white tabular-nums">
                    {item.progress}%
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold dark:text-white mb-2">{col.title}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-6">
                {col.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-white/5 h-2 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  className="flex-1 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                >
                  {expandedId === item._id ? "Hide Tasks" : "View Tasks"}
                </button>
                <button className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all">
                  Continue Path
                </button>
              </div>

              {/* Nested Resource Check-list (Simplified) */}
              <AnimatePresence>
                {expandedId === item._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 space-y-3"
                  >
                    {col.sections?.map((section: any) => (
                      <div key={section._id}>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">{section.title}</p>
                        <div className="space-y-2">
                          {section.resources?.map((res: any) => (
                            <div key={res._id} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-transparent hover:border-purple-500/20 transition-all">
                              <div className="w-4 h-4 rounded border border-purple-500/40" />
                              <span className="text-xs font-medium dark:text-gray-300">{res.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}