"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const SOFT_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }
const ENTRANCE_SPRING = { type: "spring", stiffness: 100, damping: 20, mass: 0.5 }

export default function MyCollections({ userCollections, setUserCollections, notify }: any) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // 🔥 NEW: Unstash Handler
  const handleUnstash = async (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation(); // Prevent card clicks
    if (isDeleting) return;

    setIsDeleting(collectionId);
    try {
      const res = await fetch("/api/collections/unstash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId }),
      });

      if (res.ok) {
        // Update local state to trigger the Framer Motion exit animation
        setUserCollections((prev: any) => 
          prev.filter((item: any) => item.collectionId._id !== collectionId)
        );
        if (notify) notify("Path removed from your vault");
      } else {
        const data = await res.json();
        if (notify) notify(data.error || "Failed to unstash", "error");
      }
    } catch (err) {
      if (notify) notify("Connection error", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {userCollections.map((item: any) => {
          const col = item.collectionId
          if (!col) return null

          const collectionUrl = `/collection/${col._id}`
          const isExpanded = expandedId === item._id
          // 🔥 Constraint: Progress must be 0 to unstash
          const canUnstash = item.progress === 0;

          return (
            <motion.div
              layout
              key={item._id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: ENTRANCE_SPRING },
                exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } } // Smooth exit
              }}
              whileHover={{ y: -5, transition: SOFT_SPRING }}
              className="bg-white border border-slate-200 dark:bg-[#12121a] dark:border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-colors group relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-2xl shadow-inner border border-purple-200/50 dark:border-purple-500/20"
                >
                  {item.progress === 100 ? "👑" : "🚀"}
                </motion.div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-500 block mb-1">
                    Path Mastery
                  </span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {item.progress}%
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-500 transition-colors">
                {col.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {col.description}
              </p>

              {/* Progress Bar */}
              <div className="relative w-full bg-slate-200 dark:bg-white/5 h-3 rounded-full overflow-hidden mb-8 border border-slate-300/40 dark:border-white/5 p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  className="relative h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 rounded-full"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                  className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  {isExpanded ? "Close" : "Inspect Nodes"}
                </button>

                {/* 🔥 UNSTASH BUTTON: Only shown if progress is 0 */}
                {canUnstash && (
                  <button 
                    onClick={(e) => handleUnstash(e, col._id)}
                    disabled={isDeleting === col._id}
                    className="px-5 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  >
                    {isDeleting === col._id ? "..." : "✕"}
                  </button>
                )}

                <button 
                  onClick={() => router.push(collectionUrl)}
                  className="flex-[2] py-3.5 rounded-xl bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/25 hover:bg-purple-500 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Resume Journey
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={SOFT_SPRING}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-5">
                      {col.sections?.map((section: any, idx: number) => (
                        <div key={section._id} className="group/section">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />

                            <p className="text-[10px] font-black uppercase tracking-tighter text-purple-600/80 dark:text-purple-500/70">
                              0{idx + 1} // {section.title}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            {section.resources?.slice(0, 3).map((res: any) => (
                              <motion.div 
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                key={res._id} 
                                className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-transparent group-hover/section:border-purple-500/10 transition-colors"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />

                                <span className="text-[11px] font-bold text-slate-800 dark:text-gray-300 truncate">
                                  {res.title}
                                </span>
                              </motion.div>
                            ))}

                            {section.resources?.length > 3 && (
                              <p className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest pl-5 mt-1 opacity-70 dark:opacity-60">
                                + {section.resources.length - 3} additional modules
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}