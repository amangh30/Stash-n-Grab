"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function DiscussionPortal({ collectionId, user }: any) {
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/collections/${collectionId}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
  }, [collectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    setLoading(true)
    const res = await fetch(`/api/collections/${collectionId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text })
    })
    const newComment = await res.json()
    setComments([newComment, ...comments])
    setText("")
    setLoading(false)
  }

  return (
    <div className="mt-20 space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💬</span>
        <h2 className="text-2xl font-black text-white">Discussion</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this path..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-purple-500/50 transition-all resize-none h-32"
          />
          <button
            disabled={loading}
            className="absolute bottom-4 right-4 px-6 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500 italic text-sm text-center py-4 bg-white/5 rounded-2xl border border-white/5">
          Sign in to join the discussion.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((c) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={c._id} 
            className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5"
          >
            <img 
              src={c.userId?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userId?.name}`} 
              className="w-10 h-10 rounded-full" 
              alt="" 
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">{c.userId?.name}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}