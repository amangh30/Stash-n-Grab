"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Leaderboard({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<{ top10: any[], currentUser: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1a1a24]/95 border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div>
            <h2 className="text-2xl font-black text-white">Global Leaderboard</h2>
            <p className="text-gray-400 text-sm">Top 10 stashers in the game</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">✕</button>
        </div>

        {/* Scrollable List */}
        <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading rankings...</div>
          ) : (
            data?.top10.map((u, index) => (
              <div 
                key={u._id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  index === 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-white/5 border-white/5"
                }`}
              >
                <span className={`text-lg font-black w-6 ${index === 0 ? "text-yellow-400" : "text-gray-500"}`}>#{index + 1}</span>
                <img src={u.image} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{u.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Level {u.level} • <span className="text-orange-500">🔥 {u.streak}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white leading-none">{u.xp}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔥 PERSONAL RANK SECTION */}
        {!loading && data?.currentUser && (
          <div className="p-4 bg-purple-600/20 border-t border-purple-500/30">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-2 px-1">Your Position</p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 shadow-lg shadow-purple-500/10">
              <span className="text-lg font-black w-8 text-purple-300">#{data.currentUser.rank}</span>
              <img src={data.currentUser.image} className="w-10 h-10 rounded-full border-2 border-purple-400/50" alt="" />
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{data.currentUser.name} (You)</p>
                <p className="text-[10px] text-purple-300 font-bold uppercase">Level {data.currentUser.level} • 🔥 {data.currentUser.streak}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white leading-none">{data.currentUser.xp}</p>
                <p className="text-[10px] text-purple-300 uppercase font-bold">XP</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-white/5 text-center">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-white text-black font-black text-sm hover:bg-gray-200 transition active:scale-95">
            Back to Stashing
          </button>
        </div>
      </motion.div>
    </div>
  )
}