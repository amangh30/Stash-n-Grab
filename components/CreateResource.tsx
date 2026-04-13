"use client"

import { useState } from "react"

// 🔥 Added onSuccess prop
export default function CreateResource({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    tags: ""
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.title) return

    setLoading(true)

    try {
      const res = await fetch("/api/resource", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map(t => t.trim())
        })
      })

      if (res.ok) {
        const newResource = await res.json()
        
        // 🔥 Instead of reload, we pass the new resource up
        onSuccess(newResource) 
        onClose()
      }
    } catch (error) {
      console.error("Failed to create resource:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1a1a24]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl shadow-purple-950/30">
        
        <h2 className="text-2xl font-extrabold text-white mb-6">Add New Resource</h2>

        <input
          placeholder="Title"
          className="w-full mb-4 px-4 py-3 bg-[#13131a] border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          rows={3}
          className="w-full mb-4 px-4 py-3 bg-[#13131a] border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Link"
          className="w-full mb-4 px-4 py-3 bg-[#13131a] border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition"
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />

        <input
          placeholder="Tags (comma separated)"
          className="w-full mb-6 px-4 py-3 bg-[#13131a] border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition"
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:scale-105 transition shadow-lg shadow-purple-500/30 active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}