"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function SearchBar() {
  const [query, setQuery] = useState("")

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto relative group"
    >
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg 
          className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Input Field */}
      <input
        type="text"
        placeholder="Search your stash..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 dark:bg-[#16161c]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-gray-800 dark:text-gray-100 placeholder-gray-400 transition-all shadow-sm hover:shadow-md"
      />
    </motion.div>
  )
}