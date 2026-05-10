"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Leaderboard({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<{ top10: any[], currentUser: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Close on Escape key press
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)

    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()

    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <div 
      // 🔥 CLICK BACKDROP TO CLOSE
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 transition-colors duration-500"
    >
      <motion.div
        // 🔥 STOP PROPAGATION SO CLICKS INSIDE DON'T CLOSE
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a24]/95 border border-slate-200 dark:border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-colors duration-500"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-50 dark:from-purple-500/10 to-blue-50 dark:to-blue-500/10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Global Leaderboard</h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Top 10 stashers in the vault</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable List */}
        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar flex flex-col gap-3">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
               <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-widest">Calculating Rankings</p>
            </div>
          ) : (
            data?.top10.map((u, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={u._id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  index === 0 
                    ? "bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20 shadow-sm" 
                    : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                }`}
              >
                <span className={`text-lg font-black w-6 ${index === 0 ? "text-yellow-500 dark:text-yellow-400" : "text-slate-400 dark:text-gray-500"}`}>
                  #{index + 1}
                </span>
                
                <img src={u.image} className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 shadow-sm" alt="" />
                
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-tight">
                    Level {u.level} • <span className="text-orange-500">🔥 {u.streak}</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{u.xp}</p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-bold tracking-tighter">XP</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 🔥 PERSONAL RANK SECTION */}
        <AnimatePresence>
          {!loading && data?.currentUser && (
            <motion.div 
              initial={{ y: 50 }} 
              animate={{ y: 0 }} 
              className="p-6 bg-purple-50 dark:bg-purple-600/20 border-t border-purple-100 dark:border-purple-500/30"
            >
              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-3 px-1">Your Position</p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 shadow-xl shadow-purple-500/5">
                <span className="text-lg font-black w-8 text-purple-600 dark:text-purple-300">#{data.currentUser.rank}</span>
                <img src={data.currentUser.image} className="w-10 h-10 rounded-full border-2 border-purple-400/50 shadow-sm" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{data.currentUser.name} (You)</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-300 font-bold uppercase tracking-tight">
                    Level {data.currentUser.level} • 🔥 {data.currentUser.streak}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{data.currentUser.xp}</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-300 uppercase font-bold tracking-tighter">XP</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 bg-slate-50 dark:bg-white/5 flex gap-4">
          <button 
            onClick={onClose} 
            className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-gray-200 transition shadow-lg active:scale-95"
          >
            Return to Vault
          </button>
        </div>
      </motion.div>
    </div>
  )
}