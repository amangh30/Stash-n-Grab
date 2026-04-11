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
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
}

export default function MyResources({ userResources }: any) {
  if (!userResources || userResources.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No resources yet. Start saving some 🚀
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {userResources.map((item: any) => {
        const resource = item.resourceId || {}

        const status = item.status || "not_started"
        const progress = typeof item.progress === "number" ? item.progress : 0

        return (
          <motion.div
            key={item._id?.toString()} // ✅ FIX
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl bg-purple-50/80 dark:bg-purple-900/10 backdrop-blur-md border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100/80 dark:hover:bg-purple-900/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer relative overflow-hidden group"
          >
            {/* Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all pointer-events-none" />
            
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-500/30 flex items-center justify-center mb-4 text-purple-700 dark:text-purple-300 relative z-10">
              ⭐
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors relative z-10">
              {resource.title || "Untitled Resource"}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 leading-relaxed relative z-10">
              {resource.description || "No description available"}
            </p>

            {/* Status */}
            <div className="mt-3 text-xs font-semibold text-purple-600 relative z-10">
              {status.replace("_", " ")}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded mt-3 relative z-10">
              <div
                className="bg-purple-500 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}