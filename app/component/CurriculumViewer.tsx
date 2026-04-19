"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CurriculumViewer({ collection, initialProgress, user }: any) {
  const [progress, setProgress] = useState(initialProgress)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Calculate Global Percentage
  const stats = useMemo(() => {
    const allResources = collection.sections.flatMap((s: any) => s.resources)
    const total = allResources.length
    const completed = progress.filter((p: any) => p.status === "completed").length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percent }
  }, [progress, collection])

  const toggleComplete = async (resourceId: string) => {
    if (!user) return alert("Sign in to track progress!")
    
    setUpdatingId(resourceId)
    const isCompleted = progress.find((p: any) => p.resourceId === resourceId)?.status === "completed"
    const newStatus = isCompleted ? "not_started" : "completed"

    try {
      const res = await fetch("/api/resource/status", {
        method: "PATCH",
        body: JSON.stringify({ resourceId, status: newStatus })
      })
      const updated = await res.json()
      
      // Update local state
      setProgress((prev: any) => {
        const filtered = prev.filter((p: any) => p.resourceId !== resourceId)
        return [...filtered, updated]
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-12">
      {/* 🚀 GAMIFIED PROGRESS BAR (Sticky) */}
      <div className="sticky top-24 z-40 bg-[#0b0b0f]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 mb-16 shadow-2xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Mastery Progress</span>
            <h3 className="text-2xl font-black text-white">{stats.percent}% Complete</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-500">{stats.completed} / {stats.total} Checkpoints</span>
          </div>
        </div>
        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
          />
        </div>
      </div>

      {/* ROADMAP */}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/5" />

        {collection.sections?.map((section: any, sIdx: number) => (
          <div key={section._id} className="relative pl-10 mb-16">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#0b0b0f] border-2 border-purple-500 z-10" />
            
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500 mb-8 flex items-center gap-4">
              {sIdx + 1}. {section.title}
              <div className="h-px flex-1 bg-white/5" />
            </h2>

            <div className="grid gap-4">
              {section.resources?.map((res: any) => {
                const isDone = progress.find((p: any) => p.resourceId === res._id)?.status === "completed"
                
                return (
                  <div 
                    key={res._id}
                    className={`group relative p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-6 ${
                      isDone 
                      ? "bg-emerald-500/5 border-emerald-500/20 grayscale-[0.5] opacity-60" 
                      : "bg-white/5 border-white/5 hover:border-purple-500/40"
                    }`}
                  >
                    {/* Completion Toggle */}
                    <button
                      onClick={() => toggleComplete(res._id)}
                      disabled={updatingId === res._id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                        isDone 
                        ? "bg-emerald-500 border-emerald-400 text-white" 
                        : "bg-white/5 border-white/10 text-gray-600 hover:border-purple-500"
                      }`}
                    >
                      {updatingId === res._id ? "..." : isDone ? "✓" : ""}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg transition-all ${isDone ? "text-emerald-500/80 line-through" : "text-white"}`}>
                        {res.title}
                      </h3>
                      <a href={res.link} target="_blank" className="text-xs text-gray-500 hover:text-purple-400 truncate block mt-1">
                        {res.link} ↗
                      </a>
                    </div>

                    {isDone && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 font-black text-[10px] uppercase tracking-tighter">
                        Done +10 XP
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}