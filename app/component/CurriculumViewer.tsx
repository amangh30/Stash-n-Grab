"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CurriculumViewer({ 
  collection, 
  initialProgress, 
  passedExams = [], 
  user, 
  isStashed: initialStashed 
}: any) {
  const [progress, setProgress] = useState(initialProgress)
  const [isStashed, setIsStashed] = useState(initialStashed) 
  const [clearedExams, setClearedExams] = useState(passedExams.map((e: any) => e.sectionId.toString()))
  const [activeExamSection, setActiveExamSection] = useState<any | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    setIsStashed(initialStashed)
  }, [initialStashed])

  const stats = useMemo(() => {
    const totalSections = collection.sections?.length || 0
    const completedSections = clearedExams.length
    const percent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
    return { total: totalSections, completed: completedSections, percent }
  }, [clearedExams, collection])

  // 🔥 NEW: Global XP Updater Function
  const addXP = async (amount: number, reason: string) => {
    try {
      const res = await fetch("/api/user/xp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason })
      })
      const data = await res.json()
      if (data.leveledUp) {
        alert(`🎊 LEVEL UP! You reached Level ${data.level}!`)
      }
    } catch (err) {
      console.error("XP sync failed", err)
    }
  }

  const toggleComplete = async (resourceId: string) => {
    if (!user) return alert("Sign in to track progress! 🔒")
    
    setUpdatingId(resourceId)
    
    const currentStatus = progress.find((p: any) => p.resourceId === resourceId)?.status
    const isNowMarkingDone = currentStatus !== "completed"
    const newStatus = isNowMarkingDone ? "completed" : "not_started"

    try {
      const res = await fetch("/api/resource/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, status: newStatus })
      })
      const updated = await res.json()
      
      setProgress((prev: any) => {
        const filtered = prev.filter((p: any) => p.resourceId !== resourceId)
        return [...filtered, updated]
      })

      // 🔥 AUTO-GRAB LOGIC
      if (isNowMarkingDone && !isStashed) {
        const grabRes = await fetch("/api/collections/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId: collection._id })
        })
        if (grabRes.ok) setIsStashed(true)
      }

      // 🔥 XP INJECTION: Give 10 XP for reading a resource
      if (isNowMarkingDone) {
        addXP(10, "Resource Completed")
      }

    } catch (err) {
      console.error("Update failed", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExamSubmit = async () => {
    const questions = activeExamSection.questions
    let completelyCorrect = true

    questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] !== q.correctOptionIndex) completelyCorrect = false
    })

    if (completelyCorrect) {
      const sectionIdStr = activeExamSection._id.toString()
      const alreadyCleared = clearedExams.includes(sectionIdStr)

      if (!alreadyCleared) {
        await fetch("/api/sections/exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: activeExamSection._id, passed: true })
        })
        
        // 🔥 XP INJECTION: Give 50 XP for passing an exam
        addXP(50, "Section Exam Passed")

        setClearedExams([...clearedExams, sectionIdStr])
        alert("🎉 Section Mastered! Progress Bar Unlocked +50 XP!")
      } else {
        alert("🎉 Exam passed again! Excellent review.")
      }
      
      setActiveExamSection(null)
    } else {
      setExamSubmitted(true)
      alert("❌ Verification failed. Review the resources and try this section again!")
    }
    setSelectedAnswers({})
  }

  return (
    <div className="space-y-12">
      
      {!isStashed && user && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center gap-3"
        >
          <span className="text-xl">✨</span>
          <p className="text-xs font-medium text-purple-400">
            Checking a resource will automatically add this path to your <span className="font-bold">Active Paths</span>.
          </p>
        </motion.div>
      )}

      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-24 z-40 bg-[#0b0b0f]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 mb-16 shadow-2xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Collection Mastery</span>
            <h3 className="text-2xl font-black text-white">{stats.percent}% Complete</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-500">{stats.completed} / {stats.total} Modules Mastered</span>
          </div>
        </div>
        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
          />
        </div>
      </div>

      {/* ROADMAP */}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/5" />

        {collection.sections?.map((section: any, sIdx: number) => {
          const isExamCleared = clearedExams.includes(section._id.toString())
          const allResourcesDone = section.resources?.every((res: any) => 
            progress.find((p: any) => p.resourceId === res._id)?.status === "completed"
          )

          return (
            <div key={section._id} className="relative pl-10 mb-16">
              <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 z-10 transition-colors ${isExamCleared ? "bg-emerald-500 border-emerald-400" : "bg-[#0b0b0f] border-purple-500"}`} />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">
                  {sIdx + 1}. {section.title}
                </h2>
                
                {section.questions?.length > 0 && (
                  <button
                    onClick={() => {
                      setExamSubmitted(false)
                      setActiveExamSection(section)
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition ${
                      isExamCleared 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                        : allResourcesDone 
                        ? "bg-orange-500 text-white border-transparent animate-pulse" 
                        : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {isExamCleared ? "Retake Exam ✓" : allResourcesDone ? "⚡ Take Exam" : "🔒 Exam Locked"}
                  </button>
                )}
              </div>

              {/* Resources List */}
              <div className="grid gap-4">
                {section.resources?.map((res: any) => {
                  const isDone = progress.find((p: any) => p.resourceId === res._id)?.status === "completed"
                  
                  return (
                    <div 
                      key={res._id}
                      className={`group relative p-6 rounded-[2rem] border transition-all duration-500 flex items-center gap-6 ${
                        isDone 
                        ? "bg-emerald-500/5 border-emerald-500/10" 
                        : "bg-white/5 border-white/5 hover:border-purple-500/40"
                      }`}
                    >
                      <button
                        onClick={() => toggleComplete(res._id)}
                        disabled={updatingId === res._id}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                          isDone 
                          ? "bg-emerald-500 border-emerald-400 text-white" 
                          : "bg-white/5 border-white/10 text-gray-600 hover:border-purple-500"
                        }`}
                      >
                        {updatingId === res._id ? "..." : isDone ? "✓" : ""}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg transition-all ${isDone ? "text-gray-500 line-through" : "text-white"}`}>
                          {res.title}
                        </h3>
                        <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-purple-400 truncate block mt-1">
                          {res.link} ↗
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* MCQ EXAM MODAL */}
      <AnimatePresence>
        {activeExamSection && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f13] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 max-h-[85vh] overflow-y-auto custom-scrollbar space-y-6"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Gatekeeper Terminal</span>
                <h3 className="text-2xl font-black text-white">{activeExamSection.title}</h3>
              </div>

              <div className="space-y-6">
                {activeExamSection.questions.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-sm font-bold text-gray-200">{qIdx + 1}. {q.questionText}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                          className={`w-full p-4 rounded-xl text-left text-xs font-medium border transition ${
                            selectedAnswers[qIdx] === oIdx
                              ? "bg-purple-600/20 border-purple-500 text-white" 
                              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button onClick={() => setActiveExamSection(null)} className="text-xs font-bold text-gray-500 hover:text-white">Abort</button>
                <button onClick={handleExamSubmit} className="px-6 py-2.5 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition">Submit System Verification</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}