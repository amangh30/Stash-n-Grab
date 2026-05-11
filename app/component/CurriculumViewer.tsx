"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CollectionEditor from "./CollectionEditor"
import { useRouter } from "next/navigation";

// ================= TOAST =================
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string
  type: "error" | "success"
  onClose: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-8 right-8 z-[110] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${
      type === "success"
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full animate-pulse ${
        type === "success" ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
    <span className="text-sm font-bold uppercase tracking-wider">
      {message}
    </span>

    <button
      onClick={onClose}
      className="ml-4 hover:text-black dark:hover:text-white transition-colors"
    >
      ✕
    </button>
  </motion.div>
)

// ================= MAIN =================
export default function CurriculumViewer({
  collection: initialCollection,
  initialProgress = [],
  initialHasRated = false,
  passedExams = [],
  user,
  isStashed: initialStashed = false,
}: any) {
  const router = useRouter();
  const [isStashed, setIsStashed] = useState(initialStashed)
  const [progress, setProgress] = useState<any[]>(initialProgress)
  const [collection, setCollection] = useState(initialCollection)
  const [isEditing, setIsEditing] = useState(false)

  const [clearedExams, setClearedExams] = useState<string[]>(
    () =>
      passedExams
        ?.map((e: any) => e.sectionId?.toString())
        .filter(Boolean) || []
  )

  const [activeExamSection, setActiveExamSection] = useState<any | null>(null)

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({})

  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [hasRated, setHasRated] = useState(initialHasRated)

  const [notification, setNotification] = useState<{
    msg: string
    type: "success" | "error"
  } | null>(null)

  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => setNotification(null), 4000)

    return () => clearTimeout(timer)
  }, [notification])

  const notify = (
    msg: string,
    type: "success" | "error" = "success"
  ) => setNotification({ msg, type })

  // ================= XP SYSTEM =================
  const addXP = async (amount: number, reason: string) => {
    try {
      const res = await fetch("/api/user/xp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason }),
      })

      const data = await res.json()

      if (data.leveledUp) {
        notify(`🎊 LEVEL UP! Reached Level ${data.level}!`)
      }

      if (data.newlyUnlocked?.length > 0) {
        data.newlyUnlocked.forEach((achId: string) =>
          notify(`🏆 ACHIEVEMENT: ${achId}`)
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ================= RATING =================
  const handleRate = async (stars: number) => {
    setUserRating(stars)

    try {
      const res = await fetch(`/api/collections/${collection._id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      })

      if (res.ok) {
        setHasRated(true)
        notify("⭐ Rating Verified!")
      } else {
        const data = await res.json()
        notify(data.error, "error")
      }
    } catch {
      notify("Rating failed", "error")
    }
  }

  // ================= RESOURCE TOGGLE (STREAK TRIGGER) =================
  const toggleComplete = async (resourceId: string) => {
    if (!user) return notify("Sign in to track progress! 🔒", "error");
    if (updatingId) return;

    setUpdatingId(resourceId);

    // 1. Find the current status to determine the next state
    const current = progress.find((p: any) => p.resourceId === resourceId);
    
    // 🔥 THE FIX: Ensure isNowDone is defined here so it's available in the try block
    const isNowDone = current?.status !== "completed";

    try {
      const res = await fetch("/api/resource/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resourceId, 
          status: isNowDone ? "completed" : "not_started" 
        }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      // Update local state
      setProgress((prev) => [
        ...prev.filter((p: any) => p.resourceId !== resourceId),
        updated,
      ]);

      // 2. Logic to run ONLY if the resource was marked as completed
      if (isNowDone) {
        // Since the backend now handles the streak logic, we show a themed notification
        notify("Activity logged! Keeping the fire alive 🔥");

        // Auto-stash the path if this is the user's first interaction
        if (!isStashed) {
          const stashRes = await fetch("/api/collections/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collectionId: collection._id }),
          });
          if (stashRes.ok) setIsStashed(true);
        }
      }
    } catch {
      notify("Connection error. Progress not synced.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // ================= EXAM SUBMIT =================
  const handleExamSubmit = async () => {
    const questions = activeExamSection?.questions || []

    if (Object.keys(selectedAnswers).length < questions.length) {
      return notify("Complete all questions first!", "error")
    }

    const isCorrect = questions.every(
      (q: any, i: number) =>
        selectedAnswers[i] === q.correctOptionIndex
    )

    if (!isCorrect) {
      notify(
        "Verification failed. Review the modules and retry.",
        "error"
      )

      setSelectedAnswers({})
      setActiveExamSection(null)

      return
    }

    const sId = activeExamSection._id.toString()

    try {
      const res = await fetch("/api/sections/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: activeExamSection._id,
          passed: true,
        }),
      })

      if (res.ok) {
        await addXP(50, "Section Exam Passed")

        setClearedExams((prev) =>
          prev.includes(sId) ? prev : [...prev, sId]
        )

        notify(
          "Gate Unlocked! Path Progress Increased",
          "success"
        )

        setSelectedAnswers({})
        setActiveExamSection(null)
      }
    } catch {
      notify("Sync failed.", "error")
    }
  }

  // ================= STATS =================
  const stats = useMemo(() => {
    const total = collection?.sections?.length || 0
    const completed = clearedExams.length

    return {
      total,
      completed,
      percent:
        total > 0
          ? Math.round((completed / total) * 100)
          : 0,
    }
  }, [collection, clearedExams])

    const isOwner = user?.id === collection.createdBy?._id || user?.id === collection.createdBy

  const handleEditorSave = (updatedCollection: any) => {
    setCollection(updatedCollection)
    setIsEditing(false)
    notify("Path Architecture Updated Successfully!")
    router.refresh();
  }

  // --- RENDER LOGIC ---
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <CollectionEditor 
          collection={collection} 
          onCancel={() => setIsEditing(false)} 
          onSave={handleEditorSave}
        />
      </div>
    )
  }

  return (
    <div className="relative space-y-12 max-w-4xl mx-auto px-4 py-12">
      <AnimatePresence>
        {notification && (
          <Toast
            message={notification.msg}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* ARCHITECT TOGGLE */}
      {isOwner && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
          >
            🛠️ Enter Architect Mode
          </button>
        </div>
      )}

      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-6 z-[101] bg-white/90 dark:bg-[#0b0b0f]/80 backdrop-blur-xl p-6 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-2xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] font-black text-purple-600 dark:text-purple-500 uppercase tracking-widest mb-1">
              Path Mastery Status
            </p>

            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
              {stats.percent}% VERIFIED
            </h3>
          </div>

          <span className="text-xs font-bold text-zinc-500 dark:text-gray-400">
            {stats.completed} / {stats.total} Exams Passed
          </span>
        </div>

        <div className="w-full bg-zinc-200 dark:bg-white/5 h-3 rounded-full overflow-hidden border border-zinc-300 dark:border-white/5">
          <motion.div
            animate={{ width: `${stats.percent}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full"
          />
        </div>
      </div>
      

      {/* RATING WALL */}
      <AnimatePresence>
        {stats.percent === 100 && !hasRated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 text-center"
          >
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">
              🎉 Mastery Achieved!
            </h3>

            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-125"
                >
                  {star <= (hoveredRating || userRating)
                    ? "⭐"
                    : "☆"}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.div layout className="space-y-10">
        {collection.sections?.map(
          (section: any, sIdx: number) => {
            const isExamCleared = clearedExams.includes(
              section._id.toString()
            )

            const allResourcesDone =
              section.resources?.every((res: any) =>
                progress.find(
                  (p: any) =>
                    p.resourceId === res._id &&
                    p.status === "completed"
                )
              )

            return (
              <motion.section
                key={section._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-10 border-l-2 border-zinc-200 dark:border-white/5 group"
              >
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0b0b0f] ${
                    isExamCleared
                      ? "bg-emerald-500"
                      : "bg-zinc-300 dark:bg-white/10"
                  }`}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-500 uppercase tracking-[0.4em]">
                      Module 0{sIdx + 1}
                    </span>

                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAnswers({})
                      setActiveExamSection(section)
                    }}
                    disabled={
                      isExamCleared || !allResourcesDone
                    }
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all ${
                      isExamCleared
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : allResourcesDone
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95"
                        : "bg-zinc-200 dark:bg-white/5 text-zinc-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {isExamCleared
                      ? "✓ Protocol Complete"
                      : allResourcesDone
                      ? "⚡ Initialize Gate"
                      : "🔒 Access Restricted"}
                  </button>
                </div>

                <div className="grid gap-4">
                  {section.resources?.map((res: any) => {
                    const isDone = progress.find(
                      (p: any) =>
                        p.resourceId === res._id &&
                        p.status === "completed"
                    )

                    return (
                      <div
                        key={res._id}
                        className={`group flex items-center gap-5 p-5 rounded-3xl border transition-all ${
                          isDone
                            ? "bg-emerald-500/[0.05] border-emerald-500/20 opacity-70"
                            : "bg-zinc-50 dark:bg-[#12121a] border-zinc-200 dark:border-white/5"
                        }`}
                      >
                        <button
                          onClick={() =>
                            toggleComplete(res._id)
                          }
                          disabled={!!updatingId}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${
                            isDone
                              ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              : "border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-white"
                          }`}
                        >
                          {updatingId === res._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "✓"
                          )}
                        </button>

                        <div className="flex-1">
                          <h4
                            className={`text-base font-medium ${
                              isDone
                                ? "text-zinc-400 dark:text-gray-500 line-through"
                                : "text-zinc-800 dark:text-gray-200"
                            }`}
                          >
                            {res.title}
                          </h4>

                          <a
                            href={res.link}
                            target="_blank"
                            className="text-[11px] font-bold text-zinc-600 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 mt-1 uppercase tracking-widest"
                          >
                            Deep Dive ↗
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )
          }
        )}
      </motion.div>

      {/* EXAM MODAL */}
      <AnimatePresence>
        {activeExamSection && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="bg-white dark:bg-[#0b0b0f] border border-zinc-200 dark:border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {activeExamSection.questions?.map(
                  (q: any, qIdx: number) => (
                    <div
                      key={qIdx}
                      className="space-y-5"
                    >
                      <p className="text-lg font-medium text-zinc-900 dark:text-white">
                        <span className="text-purple-600 dark:text-purple-500 font-black mr-2">
                          0{qIdx + 1}.
                        </span>

                        {q.questionText}
                      </p>

                      <div className="grid gap-3">
                        {q.options?.map(
                          (
                            opt: string,
                            oIdx: number
                          ) => (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setSelectedAnswers(
                                  (prev) => ({
                                    ...prev,
                                    [qIdx]: oIdx,
                                  })
                                )
                              }
                              className={`p-5 rounded-2xl text-left border font-semibold transition-all duration-200 ${
                                selectedAnswers[qIdx] ===
                                oIdx
                                  ? "bg-purple-600 border-purple-400 text-white shadow-[0_10px_20px_rgba(147,51,234,0.3)]"
                                  : "bg-zinc-100 dark:bg-white/[0.03] border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="p-8 bg-zinc-50 dark:bg-white/[0.02] border-t border-zinc-200 dark:border-white/5 flex gap-4">
                <button
                  onClick={() => {
                    setActiveExamSection(null)
                    setSelectedAnswers({})
                  }}
                  className="flex-1 py-4 text-xs font-black text-zinc-500 dark:text-gray-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors"
                >
                  Abort
                </button>

                <button
                  onClick={handleExamSubmit}
                  className="flex-[2] py-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 dark:hover:bg-purple-400 transition-all shadow-xl active:scale-95"
                >
                  Confirm Verification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}