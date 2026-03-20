"use client"

import { FcGoogle } from "react-icons/fc"
import Logo from "../../component/ui/logo"
import { FaGithub } from "react-icons/fa"
import { motion, Variants } from "framer-motion"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  // 1. Handle Mounting to prevent Hydration Mismatch
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    if (saved === "dark" || (!saved && prefersDark)) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // 2. Optimized Toggle Function
  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setDark(true)
    }
  }

  // Variants typed to fix TS2322
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  }

  // Prevent flash of unstyled content during hydration
  if (!mounted) return <div className="min-h-screen bg-slate-50" />

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50 dark:bg-[#0b0b0f] transition-colors duration-500">
      
      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-sm font-medium shadow-md hover:scale-105 transition text-gray-800 dark:text-white"
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
      
      {/* ANIMATED BACKGROUND BLOBS */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
      />

      {/* LEFT SIDE: Information */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-purple-700 via-purple-600 to-blue-600 dark:from-slate-900 dark:to-black text-white items-center justify-center p-10 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md"
        >
          <motion.h1 variants={itemVariants} className="text-5xl font-bold mb-6 leading-tight tracking-tight">
            Welcome to <br /> <span className="text-purple-200">Stash-n-Grab</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-white/80 mb-8">
            Save your resources, track your progress, and build your knowledge — all in one place.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-4 text-white/90 font-medium">
            {["📦 Organize your learning", "📊 Track your progress", "🚀 Stay consistent"].map((text, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 10 }}
                className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
              >
                {text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Auth Card */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="w-full max-w-md bg-white dark:bg-[#16161c] border border-gray-100 dark:border-white/5 rounded-3xl shadow-2xl p-10 flex flex-col transition-colors duration-500"
        >
          <div className="text-center mb-10">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="inline-block">
              <Logo size={60} />
            </motion.div>
            <h2 className="text-3xl font-extrabold mt-4 text-gray-900 dark:text-white tracking-tight">Stash-N-Grab</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Store. Track. Grow.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full border-2 border-gray-100 dark:border-white/10 rounded-xl p-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-semibold text-gray-700 dark:text-gray-200 shadow-sm"
            >
              <FcGoogle size={24} />
              Continue with Google
            </motion.button>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full bg-[#171717] dark:bg-white text-white dark:text-black rounded-xl p-3.5 hover:opacity-90 transition-colors font-semibold shadow-lg shadow-black/20"
            >
              <FaGithub size={24} />
              Continue with GitHub
            </motion.button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-gray-400 dark:text-gray-500 text-center mt-8 px-4"
          >
            By signing in, you agree to our <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Terms</span> & <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}