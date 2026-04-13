"use client"

import { useState } from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"

// ✅ Snappy Spring Physics
const springConfig = {
  type: "spring",
  stiffness: 260,
  damping: 20,
} as const

const layoutConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfig
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 }
  }
}

export default function MyResources({ userResources, setUserResources }: any) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [xpGain, setXpGain] = useState<number | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [newAchievement, setNewAchievement] = useState<string | null>(null)

  const activeResources = userResources.filter((i: any) => i.status !== "completed")
  const completedResources = userResources.filter((i: any) => i.status === "completed")

  const playDing = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const updateProgress = async (resourceId: string, progress: number, status: string) => {
    setLoadingId(resourceId)
    try {
      const res = await fetch("/api/resource/progress", {
        method: "POST",
        body: JSON.stringify({ resourceId, progress, status }),
      })
      const data = await res.json()
      setLoadingId(null)

      if (data.newAchievements?.length > 0) {
        playDing()
        setNewAchievement(data.newAchievements[0])
        setTimeout(() => setNewAchievement(null), 4000)
      }

      if (status === "completed") {
        setXpGain(50)
        if (data?.user?.level) setLevelUp(data.user.level)
        setTimeout(() => { setXpGain(null); setLevelUp(null); }, 2000)
      }

      setUserResources((prev: any) =>
        prev.map((item: any) =>
          item.resourceId?._id?.toString() === resourceId
            ? { ...item, progress, status }
            : item
        )
      )
    } catch (error) {
      console.error(error)
      setLoadingId(null)
    }
  }

  const handleUnsave = async (resourceId: string) => {
    setLoadingId(resourceId)
    try {
      await fetch("/api/resource/unsave", {
        method: "POST",
        body: JSON.stringify({ resourceId }),
      })
      setUserResources((prev: any) =>
        prev.filter((i: any) => i.resourceId._id.toString() !== resourceId)
      )
    } finally {
      setLoadingId(null)
    }
  }

  // Helper to render the cards
  const renderCards = (list: any[], isCompleted: boolean) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {list.map((item) => {
          const res = item.resourceId
          const id = res._id.toString()
          const isUpdating = loadingId === id

          return (
            <motion.div
              key={item._id.toString()}
              layout // 🔥 This makes the card slide when other cards exit
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={{ layout: layoutConfig }}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-3xl backdrop-blur-md border relative overflow-hidden group flex flex-col justify-between ${
                isCompleted 
                ? "bg-green-500/5 border-green-500/20 opacity-80" 
                : "bg-white/60 dark:bg-purple-900/10 border-slate-200 dark:border-purple-500/20 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-lg">
                  {isCompleted ? "🏆" : "📚"}
                </div>
                <button
                  onClick={() => handleUnsave(id)}
                  className="p-2 rounded-lg bg-red-500/5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{res.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{res.description}</p>

                <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    <span>{isCompleted ? "Mastered" : "Progress"}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${item.progress}%` }}
                      className={`h-full ${isCompleted ? "bg-green-500" : "bg-purple-600"}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                {isCompleted ? (
                  <button
                    disabled={isUpdating}
                    onClick={() => updateProgress(id, 0, "in_progress")}
                    className="w-full text-xs font-bold py-3 rounded-xl border border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                  >
                    {isUpdating ? "..." : "🔄 Repeat Stash"}
                  </button>
                ) : (
                  <>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateProgress(id, Math.min(item.progress + 20, 100), "in_progress")}
                      className="flex-1 text-xs font-bold py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all"
                    >
                      +20%
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateProgress(id, 100, "completed")}
                      className="flex-1 text-xs font-bold py-3 rounded-xl bg-purple-600 text-white shadow-lg active:scale-95 transition-all"
                    >
                      Complete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <div className="flex flex-col gap-16">
      {/* ⚡ ACTIVE SECTION */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold">⚡</span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Current Stash</h2>
        </div>
        {renderCards(activeResources, false)}
        {activeResources.length === 0 && (
          <p className="text-center text-slate-400 py-10 italic">No active tasks. Grab something! 🔒</p>
        )}
      </section>

      {/* 🏆 COMPLETED SECTION */}
      {completedResources.length > 0 && (
        <section className="pt-10 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold">🏆</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Mastered Vault</h2>
          </div>
          {renderCards(completedResources, true)}
        </section>
      )}

      {/* 🚀 POPUPS */}
      <AnimatePresence>
        {xpGain && (
          <motion.div key="xp" initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed bottom-10 right-10 z-[100] bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 border border-white/20">
            <span className="text-2xl">✨</span> +{xpGain} XP gained!
          </motion.div>
        )}

        {newAchievement && (
          <motion.div key="ach" initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 5 }} animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }} exit={{ opacity: 0, x: 50, scale: 0.5 }} className="fixed bottom-32 right-10 z-[120] flex items-center gap-4">
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
            <div className="relative flex items-center gap-4 bg-[#1a1a24]/90 backdrop-blur-2xl border-2 border-yellow-500/40 p-1 px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center text-2xl">🏆</motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Achievement</span>
                <h3 className="text-xl font-black text-white tracking-tight">{newAchievement}</h3>
              </div>
            </div>
          </motion.div>
        )}

        {levelUp && (
          <motion.div key="lvl" initial={{ opacity: 0, top: -100 }} animate={{ opacity: 1, top: 40 }} exit={{ opacity: 0, top: -100 }} className="fixed left-1/2 -translate-x-1/2 z-[101] bg-yellow-500 text-black px-10 py-5 rounded-full shadow-2xl font-black text-2xl border-4 border-white">
            🚀 LEVEL UP: {levelUp}! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}