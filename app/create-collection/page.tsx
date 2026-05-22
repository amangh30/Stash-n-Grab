"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react" // 🔥 Import useSession

interface ResourceDraft {
  title: string;
  link: string;
}

interface QuestionDraft {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface SectionDraft {
  title: string;
  resources: ResourceDraft[];
  questions: QuestionDraft[]; 
}

export default function CreateCollectionPage() {
  const { data: session, status } = useSession() // 🔥 Get session status
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    sections: [
      { 
        title: "Introduction", 
        resources: [{ title: "", link: "" }], 
        questions: [{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }] 
      }
    ] as SectionDraft[]
  })

  // 🔥 Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/") // Or "/api/auth/signin"
    }
  }, [status, router])

  // --- LOGIC FUNCTIONS (Stay the same) ---
  const addSection = () => {
    setForm({
      ...form,
      sections: [...form.sections, { 
        title: "", 
        resources: [{ title: "", link: "" }], 
        questions: [{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }] 
      }]
    })
  }

  const removeSection = (index: number) => {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) })
  }

  const updateSectionTitle = (index: number, title: string) => {
    const next = [...form.sections]; next[index].title = title;
    setForm({ ...form, sections: next })
  }

  const addResource = (sIdx: number) => {
    const next = [...form.sections]; next[sIdx].resources.push({ title: "", link: "" });
    setForm({ ...form, sections: next })
  }

  const updateResource = (sIdx: number, rIdx: number, field: keyof ResourceDraft, val: string) => {
    const next = [...form.sections]; next[sIdx].resources[rIdx][field] = val;
    setForm({ ...form, sections: next })
  }

  const removeResource = (sIdx: number, rIdx: number) => {
    const next = [...form.sections]; next[sIdx].resources = next[sIdx].resources.filter((_, i) => i !== rIdx);
    setForm({ ...form, sections: next })
  }

  const addQuestion = (sIdx: number) => {
    const next = [...form.sections];
    next[sIdx].questions.push({ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 });
    setForm({ ...form, sections: next })
  }

  const updateQuestionText = (sIdx: number, qIdx: number, val: string) => {
    const next = [...form.sections]; next[sIdx].questions[qIdx].questionText = val;
    setForm({ ...form, sections: next })
  }

  const updateQuestionOption = (sIdx: number, qIdx: number, oIdx: number, val: string) => {
    const next = [...form.sections]; next[sIdx].questions[qIdx].options[oIdx] = val;
    setForm({ ...form, sections: next })
  }

  const updateCorrectOption = (sIdx: number, qIdx: number, oIdx: number) => {
    const next = [...form.sections]; next[sIdx].questions[qIdx].correctOptionIndex = oIdx;
    setForm({ ...form, sections: next })
  }

  const removeQuestion = (sIdx: number, qIdx: number) => {
    const next = [...form.sections];
    if (next[sIdx].questions.length <= 1) return alert("Every section needs a question.");
    next[sIdx].questions = next[sIdx].questions.filter((_, i) => i !== qIdx);
    setForm({ ...form, sections: next });
  };

  const handlePublish = async () => {
    if (!isFormValid) return alert("Please fill all required fields.");
    setLoading(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to publish.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    form.title.trim() !== "" && 
    form.description.trim() !== "" &&
    form.sections.length > 0 &&
    form.sections.every(s => 
      s.title.trim() !== "" && 
      s.resources.length > 0 &&
      s.resources.every(r => r.title.trim() !== "" && r.link.trim() !== "") &&
      s.questions.length > 0 && 
      s.questions.every(q => 
        q.questionText.trim() !== "" && 
        q.options.every(o => o.trim() !== "")
      )
    );

  // 🔥 Show loading skeleton or spinner while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0b0f] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  // Prevent flicker before redirect
  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0b0f] text-slate-900 dark:text-white transition-colors duration-300">
      {/* 🚀 STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0b0f]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              onClick={() => setIsNavigatingBack(true)}
              className={`text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition text-sm font-bold flex items-center gap-2 ${
                isNavigatingBack ? "pointer-events-none opacity-80" : ""
              }`}
            >
              {isNavigatingBack ? (
                <svg 
                  className="animate-spin h-4 w-4 text-current" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>←</span>
              )}
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
            <h1 className="text-lg font-black tracking-tight italic">Studio <span className="text-purple-600 dark:text-purple-500">Vault</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handlePublish}
              disabled={loading || !isFormValid}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all duration-300
                ${isFormValid 
                  ? "bg-purple-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95" 
                  : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 cursor-not-allowed border border-slate-200 dark:border-white/10"}
                ${loading ? "opacity-50" : "opacity-100"}`}
            >
              {loading ? "Stashing..." : isFormValid ? "Publish Path" : "Complete All Fields"}
            </button>
          </div>
        </div>
      </header>

      {/* 🏗️ BUILDER CANVAS */}
      <main className="max-w-3xl mx-auto py-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* ROOT INFO */}
          <section className="space-y-6">
            <input 
              autoFocus
              placeholder="Collection Title..."
              className="w-full bg-transparent text-5xl font-black placeholder:text-slate-200 dark:placeholder:text-white/10 outline-none border-none focus:ring-0"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea 
              placeholder="Give your collection a description..."
              rows={2}
              className="w-full bg-transparent text-xl text-slate-500 dark:text-gray-500 placeholder:text-slate-200 dark:placeholder:text-white/10 outline-none border-none focus:ring-0 resize-none"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </section>

          <div className="h-px bg-slate-200 dark:bg-white/5" />

          {/* SECTIONS LIST */}
          <section className="space-y-8 pb-32">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600 dark:text-purple-500">Architecture Structure</h2>
              <button 
                onClick={addSection}
                className="text-[10px] font-black uppercase px-4 py-2 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-sm dark:shadow-none"
              >
                + New Node
              </button>
            </div>

            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {form.sections.map((section, sIdx) => (
                  <motion.div 
                    key={sIdx}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none"
                  >
                    {/* Section Header */}
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-500 flex items-center justify-center font-black text-xs">
                        0{sIdx + 1}
                      </div>
                      <input 
                        placeholder="Section Title..."
                        value={section.title}
                        className="flex-1 bg-transparent text-xl font-bold outline-none border-b border-transparent focus:border-purple-600 dark:focus:border-purple-500 transition"
                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                      />
                      <button 
                        onClick={() => removeSection(sIdx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-gray-600 hover:text-red-500 transition text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Resources List */}
                    <div className="space-y-4 pl-12 border-l-2 border-slate-100 dark:border-white/5 mb-8">
                      {section.resources.map((res, rIdx) => (
                        <motion.div key={rIdx} layout className="flex gap-4 items-center">
                          <input 
                            placeholder="Resource Name"
                            value={res.title}
                            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm focus:border-purple-400 dark:focus:border-purple-500/50 outline-none transition"
                            onChange={(e) => updateResource(sIdx, rIdx, 'title', e.target.value)}
                          />
                          <input 
                            placeholder="URL"
                            value={res.link}
                            className="flex-[2] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm text-slate-500 dark:text-gray-400 focus:border-purple-400 dark:focus:border-purple-500/50 outline-none transition font-mono"
                            onChange={(e) => updateResource(sIdx, rIdx, 'link', e.target.value)}
                          />
                          <button 
                            onClick={() => removeResource(sIdx, rIdx)}
                            className="text-slate-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 transition"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                      
                      <button 
                        onClick={() => addResource(sIdx)}
                        className="mt-2 text-[10px] font-black uppercase text-purple-600/60 dark:text-purple-500/60 hover:text-purple-600 dark:hover:text-purple-400 transition tracking-widest"
                      >
                        + Add Link to {section.title || "Section"}
                      </button>
                    </div>

                    {/* 🔥 SECTION MCQ EXAM BUILDER */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-4 pl-12">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-500">
                          Section Gatekeeper Exam
                        </h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(sIdx)}
                          className="text-[10px] font-black uppercase bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition"
                        >
                          + Add MCQ Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {section.questions?.map((q, qIdx) => (
                          <div key={qIdx} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 relative">
                            <div className="flex justify-between items-center gap-4">
                              <input
                                placeholder={`Question ${qIdx + 1}...`}
                                value={q.questionText}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm outline-none focus:border-orange-400 dark:focus:border-orange-500/40 transition"
                                onChange={(e) => updateQuestionText(sIdx, qIdx, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeQuestion(sIdx, qIdx)}
                                className={`${section.questions.length <= 1 ? 'hidden' : 'flex'} text-slate-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold`}
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3 bg-white dark:bg-black/20 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 focus-within:border-orange-300 dark:focus-within:border-orange-500/20 transition">
                                  <input
                                    type="radio"
                                    name={`correct-${sIdx}-${qIdx}`}
                                    checked={q.correctOptionIndex === oIdx}
                                    onChange={() => updateCorrectOption(sIdx, qIdx, oIdx)}
                                    className="accent-orange-600 dark:accent-orange-500 cursor-pointer w-4 h-4"
                                  />
                                  <input
                                    placeholder={`Option ${oIdx + 1}`}
                                    value={opt}
                                    className="bg-transparent text-xs outline-none flex-1 placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                    onChange={(e) => updateQuestionOption(sIdx, qIdx, oIdx, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </motion.div>
      </main>

      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 dark:bg-blue-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}