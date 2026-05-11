"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    if (saved === "dark" || (!saved && prefersDark)) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newDark = !dark
    setDark(newDark)
    
    if (newDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) return null

  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed top-6 left-6 z-[100] flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-[#12121a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-sm font-black uppercase tracking-widest shadow-xl shadow-purple-500/5 transition-colors duration-500 text-slate-800 dark:text-white"
    >
      {/* Icon Animation Container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dark ? "sun" : "moon"}
            initial={{ y: 10, opacity: 0, rotate: -40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -10, opacity: 0, rotate: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-lg"
          >
            {dark ? "☀️" : "🌙"}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="hidden md:inline-block">
        {dark ? "Light" : "Dark"}
      </span>
    </motion.button>
  )
}