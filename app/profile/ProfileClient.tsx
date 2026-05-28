"use client"

import { motion, Variants } from "framer-motion"
import { useRouter } from "next/navigation"
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
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
}

// 🔥 Changed prop from userResources to userCollections
export default function ProfileClient({ session, user, userCollections = [] }: any) {
  const router = useRouter()
    const [navigatingId, setNavigatingId] = useState<string | null>(null);
  
  const avatarUrl =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'fallback'}`

  const stashedPaths = userCollections.length

  return (
    <div className="min-h-screen px-4 md:px-10 py-12 max-w-6xl mx-auto relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-12"
      >
        {/* 1. HERO HEADER */}
        <motion.div 
          variants={itemVariants}
          className="relative flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <img
              src={avatarUrl}
              alt="avatar"
              className="relative w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-2xl object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {session?.user?.name || "Anonymous Learner"}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Rank</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">Level {user.level}</span>
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total XP</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{user.xp} XP</span>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

              <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{user.streak} Day Streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. STATS GRID (Updated for Gamification & Collections) */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Paths Stashed", value: stashedPaths, icon: "📁", color: "from-blue-500 to-cyan-400" },
            { label: "Current Level", value: user.level, icon: "⭐", color: "from-green-500 to-emerald-400" },
            { label: "Total XP Earned", value: user.xp, icon: "⚡", color: "from-purple-500 to-pink-400" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group p-8 rounded-[2rem] bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border border-white/20 dark:border-white/5 hover:border-purple-500/30 transition-all text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-white/10 blur-3xl rounded-full" />
              <span className="text-3xl mb-4 block relative z-10">{stat.icon}</span>
              <p className="text-5xl font-black text-slate-900 dark:text-white relative z-10 tabular-nums">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 mt-2 uppercase tracking-widest relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. ACHIEVEMENTS SECTION */}
        {user.achievements && user.achievements.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Achievements</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {user.achievements.map((a: string, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="relative p-4 rounded-2xl bg-gradient-to-br from-yellow-400/10 to-orange-500/5 border border-yellow-500/20 flex flex-col items-center text-center gap-2 group"
                >
                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-3xl">🏆</span>
                  <span className="text-[11px] font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-tight">
                    {a}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4. ACTIVE PATHS (Collections Stash) */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Active Paths</h2>
            </div>
          </div>

          {stashedPaths === 0 ? (
            <div className="p-10 text-center rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5">
              <p className="text-slate-500 dark:text-gray-400 font-medium">You haven't stashed any paths yet. Explore the vault!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userCollections.map((item: any) => {
                const col = item.collectionId
                if (!col) return null // Safe guard in case a collection was deleted

                return (
                  <motion.div
                    key={item._id}
                    layout
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2rem] bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:border-purple-500/30 transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
                    
                    <div className="relative z-10 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-xl mb-6">
                        📁
                      </div>

                      <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors tracking-tight">
                        {col.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                      <button
                        onClick={() => {
                          setNavigatingId(col._id);
                          router.push(`/collection/${col._id}`);
                        }}
                        disabled={navigatingId === col._id}
                        className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                          navigatingId === col._id
                            ? "bg-purple-600 text-white opacity-90 cursor-not-allowed pointer-events-none"
                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white active:scale-95"
                        }`}
                      >
                        {navigatingId === col._id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Continue Path ↗</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}