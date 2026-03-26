"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
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
    } else {
      document.documentElement.classList.remove("dark")
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

  // Prevent flash of unstyled content during hydration
  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="fixed cursor-pointer top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-sm font-medium shadow-md hover:scale-105 transition text-gray-800 dark:text-white"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}