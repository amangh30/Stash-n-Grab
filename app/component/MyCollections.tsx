"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Transition } from "framer-motion"
import { useRouter } from "next/navigation"

const SOFT_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}
const ENTRANCE_SPRING: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.5,
}

export default function MyCollections({ userCollections, setUserCollections, notify }: any) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  // 🔥 NEW: Track which specific collection is currently routing
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

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

  // 🔥 NEW: Navigation Handler
  const handleNavigate = (collectionId: string, url: string) => {
    setNavigatingId(collectionId);
    router.push(url);
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
          const canUnstash = item.progress === 0;
          // 🔥 NEW: Check if this specific card is navigating
          const isNavigating = navigatingId === col._id;

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
                    className="px-5 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                  >
                    {isDeleting === col._id ? (
                      <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "✕"}
                  </button>
                )}

                {/* 🔥 UPDATED NAVIGATION BUTTON */}
                <button 
                  onClick={() => handleNavigate(col._id, collectionUrl)}
                  disabled={isNavigating}
                  className={`flex-[2] py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                    item.progress === 100 
                      ? "bg-[#0066FF] text-white shadow-[0_0_18px_rgba(0,102,255,0.45),0_0_42px_rgba(0,153,255,0.28)] hover:bg-[#0A7CFF] hover:shadow-[0_0_24px_rgba(0,102,255,0.65),0_0_60px_rgba(0,153,255,0.4)]"
                      : "bg-purple-600 text-white shadow-purple-500/25 hover:bg-purple-500"
                  } ${isNavigating ? "opacity-90 cursor-not-allowed pointer-events-none" : "active:scale-95 hover:-translate-y-0.5"}`}
                >
                  {isNavigating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>{item.progress === 100 ? "Review Mastery" : "Resume Journey"}</span>
                  )}
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