"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DiscussionPortal({ collectionId, user }: any) {
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/collections/${collectionId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
  }, [collectionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    setLoading(true)

    const res = await fetch(`/api/collections/${collectionId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
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

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Discussion
        </h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this path..."
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none h-32 shadow-sm dark:shadow-none"
          />

          <button
            disabled={loading}
            className="absolute bottom-4 right-4 px-6 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-slate-500 dark:text-gray-500 italic text-sm text-center py-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          Sign in to join the discussion.
        </p>
      )}

      <div className="space-y-6">
        {comments.map((c) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none transition-all hover:border-purple-200 dark:hover:border-purple-500/20 hover:shadow-md dark:hover:bg-white/[0.07]"
          >
            <img
              src={
                c.userId?.image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userId?.name}`
              }
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 object-cover ring-2 ring-transparent group-hover:ring-purple-500/20 transition-all"
              alt={c.userId?.name || "User Avatar"}
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Improved Profile Link */}
                <Link
                  href={`/profile/${c.userId?._id}`}
                  className="
                    group/link
                    relative
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    font-bold
                    text-slate-900
                    dark:text-white
                    transition-all
                    duration-200
                    hover:text-purple-600
                    dark:hover:text-purple-400
                  "
                >
                  <span className="relative">
                    {c.userId?.name}

                    {/* Animated underline */}
                    <span
                      className="
                        absolute
                        left-0
                        -bottom-0.5
                        h-[2px]
                        w-0
                        bg-gradient-to-r
                        from-purple-500
                        to-pink-500
                        transition-all
                        duration-300
                        group-hover/link:w-full
                      "
                    />
                  </span>

                  {/* Tiny hover arrow */}
                  <span
                    className="
                      opacity-0
                      -translate-x-1
                      group-hover/link:opacity-100
                      group-hover/link:translate-x-0
                      transition-all
                      duration-200
                      text-xs
                    "
                  >
                    →
                  </span>
                </Link>

                <span className="text-[10px] text-slate-400 dark:text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Comment Text */}
              <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                {c.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}