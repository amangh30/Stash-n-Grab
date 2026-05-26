"use client"

import { motion, Variants } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function PublicProfileClient({ user, userCollections = [] }: any) {
  const router = useRouter()
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  
  const avatarUrl = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'fallback'}`
  const stashedPaths = userCollections.length

  return (
    // Updated background to handle light/dark transition
    <div className="min-h-screen px-4 md:px-10 py-12 max-w-6xl mx-auto relative z-10 transition-colors duration-500">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-12">
        
        {/* 1. HERO HEADER */}
        <motion.div 
          variants={itemVariants} 
          className="relative flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/70 dark:bg-[#0b0b0f]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-10 rounded-[2.5rem] shadow-xl dark:shadow-2xl overflow-hidden transition-all"
        >
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/[0.05] dark:bg-purple-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-10 dark:opacity-20 pointer-events-none" />
            <img 
              src={avatarUrl} 
              alt="avatar" 
              className="relative w-32 h-32 rounded-full border-4 border-white dark:border-[#0b0b0f] shadow-lg dark:shadow-[0_0_30px_rgba(147,51,234,0.3)] object-cover" 
            />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {user.name || "Anonymous Learner"}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Rank</span>
                <span className="text-lg font-bold text-slate-800 dark:text-gray-200">Level {user.level || 1}</span>
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Total XP</span>
                <span className="text-lg font-bold text-slate-800 dark:text-gray-200">{user.xp || 0} XP</span>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

              <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{user.streak || 0} Day Streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. ACHIEVEMENTS SHOWCASE */}
        {user.achievements && user.achievements.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Trophy Room</h2>
            </div>

            <div className="flex flex-wrap gap-4">
              {user.achievements.map((a: string, i: number) => (
                <div key={i} className="px-5 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <span className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-widest">{a}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. PUBLIC VAULT (Stashed Paths) */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Public Vault</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{stashedPaths} Paths</span>
          </div>

          {stashedPaths === 0 ? (
            <div className="p-10 text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <p className="text-slate-500 dark:text-gray-400 font-medium">This user hasn't stashed any paths yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userCollections.map((item: any) => {
                const col = item.collectionId
                if (!col) return null 

                return (
                  <motion.div
                    key={item._id}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2rem] bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 hover:border-purple-500/30 shadow-sm hover:shadow-xl dark:shadow-none transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/[0.03] dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/[0.08] dark:group-hover:bg-purple-500/20 transition-all" />
                    
                    <div className="relative z-10 flex-1">
                      <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-tight">
                        {col.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                      <button
                        onClick={() => {
                          setInspectingId(col._id);
                          router.push(`/collection/${col._id}`);
                        }}
                        disabled={inspectingId === col._id}
                        className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                          inspectingId === col._id
                            ? "bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-gray-500 cursor-not-allowed pointer-events-none"
                            : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95"
                        }`}
                      >
                        {inspectingId === col._id ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Inspect Path ↗</span>
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