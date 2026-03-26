"use client"

import { motion, Variants } from "framer-motion"
// Animation configs
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
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function ProfileClient({ session, user, userResources }: any) {
  const avatarUrl =
    session?.user?.image ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"

  const saved = userResources.length

  const completed = userResources.filter(
    (r: any) => r.status === "completed"
  ).length

  const inProgress = userResources.filter(
    (r: any) => r.status === "in_progress"
  ).length

  return (
    <div className="min-h-screen px-4 md:px-10 py-12 max-w-6xl mx-auto relative z-10">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        {/* HEADER */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/40 transition-all duration-500" />
            <img
              src={avatarUrl}
              alt="avatar"
              className="relative w-24 h-24 rounded-full border-4 border-white dark:border-[#16161c] shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="text-center md:text-left mt-2 md:mt-0 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {session?.user?.name || "Anonymous Learner"}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-sm font-medium">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg shadow-sm border border-purple-200 dark:border-purple-500/30">
                Level {user.level}
              </span>

              <span className="text-slate-400 dark:text-gray-500">•</span>

              <span className="text-slate-600 dark:text-gray-300">
                {user.xp} XP
              </span>

              <span className="text-slate-400 dark:text-gray-500">•</span>

              <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg shadow-sm border border-orange-100 dark:border-orange-500/20">
                🔥 {user.streak} day streak
              </span>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Saved", value: saved, icon: "📌", color: "from-blue-500/10 to-transparent", border: "border-blue-200 dark:border-blue-500/20" },
            { label: "Completed", value: completed, icon: "✅", color: "from-green-500/10 to-transparent", border: "border-green-200 dark:border-green-500/20" },
            { label: "In Progress", value: inProgress, icon: "⏳", color: "from-purple-500/10 to-transparent", border: "border-purple-200 dark:border-purple-500/20" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-6 rounded-3xl bg-white/60 dark:bg-[#16161c]/80 backdrop-blur-md border ${stat.border} hover:shadow-xl transition-all text-center relative overflow-hidden flex flex-col items-center justify-center`}
            >
              <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${stat.color} pointer-events-none`} />
              
              <span className="text-2xl mb-2 relative z-10">{stat.icon}</span>
              <p className="text-4xl font-extrabold text-slate-800 dark:text-white relative z-10">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1 uppercase tracking-wider relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* RESOURCES */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">My Stash</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userResources.map((item: any) => (
              <motion.div
                key={item._id}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-purple-50/80 dark:bg-purple-900/10 backdrop-blur-md border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100/80 dark:hover:bg-purple-900/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all pointer-events-none" />
                
                <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors relative z-10">
                  {item.resourceId.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 leading-relaxed relative z-10">
                  {item.resourceId.description}
                </p>

                <div className="mt-3 text-xs font-semibold text-purple-600 relative z-10">
                  {item.status.replace("_", " ")}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2 rounded mt-3 relative z-10">
                  <div
                    className="bg-purple-500 h-2 rounded"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}