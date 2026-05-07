"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function MyCollections({ userCollections, setUserCollections }: any) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence mode="popLayout">
        {userCollections.map((item: any) => {
          const col = item.collectionId
          if (!col) return null

          // 🔥 Use the actual Collection ID for navigation
          const collectionUrl = `/collection/${col._id}`

          return (
            <motion.div
              layout
              key={item._id}
              className="bg-white/60 dark:bg-purple-900/10 backdrop-blur-md border border-slate-200 dark:border-purple-500/20 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              {/* Subtle Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-xl shadow-inner">
                  {item.progress === 100 ? "👑" : "🚀"}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                    Collection Mastery
                  </span>
                  <p className="text-2xl font-black dark:text-white tabular-nums">
                    {item.progress}%
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-black dark:text-white mb-2 tracking-tight">
                {col.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-6 font-medium">
                {col.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-white/5 h-2 rounded-full overflow-hidden mb-8 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  className="flex-1 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  {expandedId === item._id ? "Close Details" : "Quick View"}
                </button>
                <button 
                  onClick={() => router.push(collectionUrl)} // 🔥 Corrected ID usage
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95"
                >
                  Continue Path
                </button>
              </div>

              {/* Nested Resource Preview */}
              <AnimatePresence>
                {expandedId === item._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 space-y-4"
                  >
                    {col.sections?.map((section: any, idx: number) => (
                      <div key={section._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                           <p className="text-[10px] font-black uppercase text-purple-500/60">
                             Module {idx + 1}: {section.title}
                           </p>
                        </div>
                        <div className="grid gap-2">
                          {section.resources?.slice(0, 3).map((res: any) => (
                            <div key={res._id} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-transparent">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                              <span className="text-[11px] font-bold dark:text-gray-400 truncate">{res.title}</span>
                            </div>
                          ))}
                          {section.resources?.length > 3 && (
                            <p className="text-[9px] text-gray-500 italic pl-4">
                              + {section.resources.length - 3} more resources
                            </p>
                          )}
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