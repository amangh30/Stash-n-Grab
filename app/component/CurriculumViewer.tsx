"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function CurriculumViewer({ 
  collection, 
  initialProgress, 
  initialHasRated = false,
  passedExams = [], 
  user, 
  isStashed: initialStashed 
}: any) {
  const [progress, setProgress] = useState(initialProgress)
  const [isStashed, setIsStashed] = useState(initialStashed) 
  const [clearedExams, setClearedExams] = useState(passedExams.map((e: any) => e.sectionId.toString()))
  const [activeExamSection, setActiveExamSection] = useState<any | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Rating States
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0) 
  const [hasRated, setHasRated] = useState(initialHasRated)

  useEffect(() => {
    setIsStashed(initialStashed)
  }, [initialStashed])

  const stats = useMemo(() => {
    const totalSections = collection.sections?.length || 0
    const completedSections = clearedExams.length
    const percent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
    return { total: totalSections, completed: completedSections, percent }
  }, [clearedExams, collection])

  // XP logic
  const addXP = async (amount: number, reason: string) => {
    try {
      const res = await fetch("/api/user/xp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason })
      })
      const data = await res.json()
      if (data.leveledUp) alert(`🎊 LEVEL UP! You reached Level ${data.level}!`)
      if (data.newlyUnlocked?.length > 0) {
        data.newlyUnlocked.forEach((achId: string) => alert(`🏆 ACHIEVEMENT UNLOCKED: ${achId}!`))
      }
    } catch (err) {
      console.error("XP sync failed", err)
    }
  }

  // 🔥 Rating Logic (Fixed to Plural: collections)
  const handleRate = async (stars: number) => {
    setUserRating(stars)
    try {
      const res = await fetch(`/api/collections/${collection._id}/rate`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars })
      })
      if (res.ok) {
        setHasRated(true)
        alert("⭐ Thank you for the verified rating!")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save rating.")
      }
    } catch (err) {
      console.error("Rating failed", err)
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
      setProgress((prev: any) => [...prev.filter((p: any) => p.resourceId !== resourceId), updated])

      // 🔥 Auto-Grab Logic (Fixed to Plural: collections)
      if (isNowMarkingDone && !isStashed) {
        const grabRes = await fetch("/api/collections/save", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId: collection._id })
        })
        if (grabRes.ok) setIsStashed(true)
      }

      if (isNowMarkingDone) addXP(10, "Resource Completed")
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
      if (!clearedExams.includes(sectionIdStr)) {
        await fetch("/api/sections/exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: activeExamSection._id, passed: true })
        })
        addXP(50, "Section Exam Passed")
        setClearedExams([...clearedExams, sectionIdStr])
        alert("🎉 Section Mastered! +50 XP!")
      }
      setActiveExamSection(null)
    } else {
      alert("❌ Verification failed. Review and try again!")
    }
    setSelectedAnswers({})
  }

  return (
    <div className="space-y-12">
      {/* Auto-grab Notification */}
      {!isStashed && user && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center gap-3">
          <p className="text-xs font-medium text-purple-400">✨ Interaction will auto-stash this path.</p>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="sticky top-24 z-40 bg-[#0b0b0f]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="flex justify-between items-end mb-4 text-white">
          <h3 className="text-2xl font-black">{stats.percent}% Complete</h3>
          <span className="text-sm font-bold text-gray-500">{stats.completed} / {stats.total} Mastered</span>
        </div>
        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
          <motion.div animate={{ width: `${stats.percent}%` }} className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(147,51,234,0.4)]" />
        </div>
      </div>

      {/* Rating Section */}
      <AnimatePresence>
        {stats.percent === 100 && !hasRated && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 text-center">
            <h3 className="text-xl font-black text-white mb-6">🎉 How would you rate this path?</h3>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-125"
                >
                  {star <= (hoveredRating || userRating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap */}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/5" />
        {collection.sections?.map((section: any, sIdx: number) => {
          const isExamCleared = clearedExams.includes(section._id.toString());
          const allResourcesDone = section.resources?.every((res: any) => 
            progress.find((p: any) => p.resourceId === res._id)?.status === "completed"
          );

          return (
            <div key={section._id} className="relative pl-10 mb-16">
              <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 z-10 transition-colors ${isExamCleared ? "bg-emerald-500 border-emerald-400" : "bg-[#0b0b0f] border-purple-500"}`} />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">{sIdx + 1}. {section.title}</h2>
                {section.questions?.length > 0 && (
                  <button
                    onClick={() => setActiveExamSection(section)}
                    disabled={isExamCleared}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition ${isExamCleared ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : allResourcesDone ? "bg-orange-500 text-white animate-pulse" : "bg-white/5 text-gray-500 border-white/10"}`}
                  >
                    {isExamCleared ? "Mastered ✓" : allResourcesDone ? "⚡ Take Exam" : "🔒 Exam Locked"}
                  </button>
                )}
              </div>
              <div className="grid gap-4">
                {section.resources?.map((res: any) => {
                  const isDone = progress.find((p: any) => p.resourceId === res._id)?.status === "completed";
                  return (
                    <div key={res._id} className={`p-6 rounded-[2rem] border transition-all flex items-center gap-6 ${isDone ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/5 border-white/5"}`}>
                      <button onClick={() => toggleComplete(res._id)} disabled={updatingId === res._id} className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDone ? "bg-emerald-500 text-white" : "text-gray-600"}`}>
                        {updatingId === res._id ? "..." : isDone ? "✓" : ""}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg ${isDone ? "text-gray-500 line-through" : "text-white"}`}>{res.title}</h3>
                        <a href={res.link} target="_blank" className="text-xs text-gray-500 hover:text-purple-400 truncate block mt-1">{res.link} ↗</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exam Modal */}
      <AnimatePresence>
        {activeExamSection && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0f0f13] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-2xl font-black text-white">{activeExamSection.title}</h3>
              {activeExamSection.questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-bold text-gray-200">{qIdx + 1}. {q.questionText}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt: string, oIdx: number) => (
                      <button
                        key={oIdx}
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                        className={`p-4 rounded-xl text-left text-xs border transition ${selectedAnswers[qIdx] === oIdx ? "bg-purple-600/20 border-purple-500 text-white" : "bg-white/5 border-white/5 text-gray-400"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setActiveExamSection(null)} className="text-xs font-bold text-gray-500">Abort</button>
                <button onClick={handleExamSubmit} className="px-6 py-2.5 bg-orange-500 text-white text-xs font-black uppercase rounded-xl">Submit Verification</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}