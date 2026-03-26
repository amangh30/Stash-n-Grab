"use client"

import { motion } from "framer-motion"

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
}

export default function ResourceList() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {[1, 2, 3, 4].map((item) => (
        <motion.div
          key={item}
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            📚
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Resource Title {item}
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
            A short, descriptive summary of the resource goes right here.
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}