"use client"

import { motion, AnimatePresence } from "framer-motion"

interface SearchBarProps {
  query: string
  setQuery: (val: string) => void
  isLoading?: boolean // 🔥 Let the input show a spinner while fetching data
}

export default function SearchBar({ query, setQuery, isLoading = false }: SearchBarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto relative group"
    >
      {/* LEFT ICON: Search glass or dynamic system spinner */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        {isLoading ? (
          // Glassmorphic loading loop
          <svg className="animate-spin h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      
      {/* INPUT INTERFACE */}
      <input
        type="text"
        placeholder="Search collections, modules, or tools..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/70 dark:bg-[#16161c]/50 backdrop-blur-md border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-gray-800 dark:text-gray-100 placeholder-gray-400 transition-all shadow-sm hover:shadow-md"
      />

      {/* RIGHT ACTION: Interactive Clear Button */}
      <AnimatePresence>
        {query.length > 0 && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-4 flex items-center justify-center p-1 my-auto h-7 w-7 rounded-xl bg-slate-200/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}