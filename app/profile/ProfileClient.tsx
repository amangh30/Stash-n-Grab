"use client"

import { motion, Variants } from "framer-motion"

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

export default function ProfileClient({ session, user, userResources }: any) {
  const avatarUrl =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'fallback'}`

  const saved = userResources.length
  const completed = userResources.filter((r: any) => r.status === "completed").length
  const inProgress = userResources.filter((r: any) => r.status === "in_progress").length

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

        {/* 2. STATS GRID */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Resources Stashed", value: saved, icon: "📦", color: "from-blue-500 to-cyan-400" },
            { label: "Mastered Vault", value: completed, icon: "🏆", color: "from-green-500 to-emerald-400" },
            { label: "Learning Path", value: inProgress, icon: "⚡", color: "from-purple-500 to-pink-400" }
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

        {/* 3. ACHIEVEMENTS SECTION (Refined) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Achievements</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {user.achievements?.map((a: string, i: number) => (
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

        {/* 4. RESOURCE STASH */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Stash</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userResources.map((item: any) => (
              <motion.div
                key={item._id}
                layout
                whileHover={{ y: -8 }}
                className="p-6 rounded-3xl bg-white/60 dark:bg-purple-900/10 backdrop-blur-md border border-slate-200 dark:border-purple-500/20 hover:shadow-2xl transition-all relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4">
                   <div className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-500/30">
                    {item.status.replace("_", " ")}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 group-hover:text-purple-600 transition-colors">
                  {item.resourceId.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.resourceId.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                    <span>Mastery</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}