"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CollectionEditor({ collection, onCancel, onSave }: any) {
  const [formData, setFormData] = useState({ ...collection })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/collections/${collection._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const updated = await res.json()
        onSave(updated)
      }
    } catch (err) {
      console.error("Failed to save architecture", err)
    } finally {
      setIsSaving(false)
    }
  }

  const updateResource = (sIdx: number, rIdx: number, field: string, value: string) => {
    const newSections = [...formData.sections]
    newSections[sIdx].resources[rIdx][field] = value
    setFormData({ ...formData, sections: newSections })
  }

  const addResource = (sIdx: number) => {
    const newSections = [...formData.sections]
    newSections[sIdx].resources.push({ title: "New Resource", link: "" })
    setFormData({ ...formData, sections: newSections })
  }

  const removeResource = (sIdx: number, rIdx: number) => {
    const newSections = [...formData.sections]
    newSections[sIdx].resources = newSections[sIdx].resources.filter((_: any, i: number) => i !== rIdx)
    setFormData({ ...formData, sections: newSections })
  }

  return (
    <div className="space-y-12 pb-32">
      {/* --- FLOATING ARCHITECT BAR --- */}
      <section className="sticky top-6 z-[60] p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-purple-500/30 flex justify-between items-center shadow-xl dark:shadow-2xl transition-colors">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">ARCHITECT MODE</h2>
          <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em]">Live Architecture Sync</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-2 bg-purple-600 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
          >
            {isSaving ? "Pushing to DB..." : "Deploy Updates"}
          </button>
        </div>
      </section>

      {/* --- SECTION 1: GENERAL INFO --- */}
      <section className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-6 transition-colors">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Path Title</label>
          <input 
            className="w-full bg-white dark:bg-zinc-800/30 p-4 rounded-2xl text-3xl font-black text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/5 focus:border-purple-500 transition-all shadow-sm dark:shadow-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Advanced System Design"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Path Description</label>
          <textarea 
            className="w-full bg-white dark:bg-zinc-800/30 p-4 rounded-2xl text-slate-600 dark:text-zinc-400 outline-none border border-slate-200 dark:border-white/5 focus:border-purple-500 transition-all min-h-[100px] resize-none shadow-sm dark:shadow-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What will learners achieve in this vault?"
          />
        </div>
      </section>

      {/* --- SECTION 2: MODULE ARCHITECTURE --- */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.4em]">Curriculum Nodes</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        {formData.sections.map((section: any, sIdx: number) => (
          <motion.div 
            layout
            key={sIdx} 
            className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors relative shadow-sm dark:shadow-none"
          >
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xl font-black text-purple-600/30 dark:text-purple-500/30 italic">Module {sIdx + 1}</span>
              <input 
                className="flex-1 bg-transparent text-xl font-bold text-slate-900 dark:text-white outline-none border-b border-slate-200 dark:border-white/10 focus:border-purple-500 transition-colors"
                value={section.title}
                onChange={(e) => {
                  const newSecs = [...formData.sections]
                  newSecs[sIdx].title = e.target.value
                  setFormData({ ...formData, sections: newSecs })
                }}
              />
              <button 
                onClick={() => {
                   const newSecs = formData.sections.filter((_: any, i: number) => i !== sIdx);
                   setFormData({...formData, sections: newSecs});
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Resources List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Resource Links</span>
                <button 
                  onClick={() => addResource(sIdx)}
                  className="text-[9px] font-black text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <span>+</span> ADD NODE
                </button>
              </div>

              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {section.resources.map((res: any, rIdx: number) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={rIdx} 
                      className="flex flex-col md:flex-row gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-white/5"
                    >
                      <input 
                        placeholder="Title (e.g., Intro to Kafka)"
                        className="flex-[2] bg-white dark:bg-zinc-800/40 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-transparent focus:border-purple-500/50 transition-all"
                        value={res.title}
                        onChange={(e) => updateResource(sIdx, rIdx, "title", e.target.value)}
                      />
                      <input 
                        placeholder="URL (https://...)"
                        className="flex-[3] bg-white dark:bg-zinc-800/40 rounded-xl px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-mono outline-none border border-slate-200 dark:border-transparent focus:border-blue-500/50 transition-all"
                        value={res.link}
                        onChange={(e) => updateResource(sIdx, rIdx, "link", e.target.value)}
                      />
                      <button 
                        onClick={() => removeResource(sIdx, rIdx)}
                        className="px-2 text-slate-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Append New Module */}
        <button 
          onClick={() => setFormData({
            ...formData, 
            sections: [...formData.sections, { title: "New Module", resources: [], questions: [] }]
          })}
          className="w-full py-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-600 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex flex-col items-center gap-2 group"
        >
          <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">🏗️</span>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Construct New Module</span>
        </button>
      </div>
    </div>
  )
}