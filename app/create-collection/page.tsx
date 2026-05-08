"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  questions: QuestionDraft[]; // 🔥 Fixed type from [] to QuestionDraft[]
}

export default function CreateCollectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Update Initial State
  const [form, setForm] = useState({
    title: "",
    description: "",
    sections: [
      { 
        title: "Introduction", 
        resources: [{ title: "", link: "" }], 
        questions: [{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }] // 🔥 Added initial question
      }
    ] as SectionDraft[]
  })

  // Update addSection function
  const addSection = () => {
    setForm({
      ...form,
      sections: [
        ...form.sections, 
        { 
          title: "", 
          resources: [{ title: "", link: "" }], 
          questions: [{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }] // 🔥 Added initial question
        }
      ]
    })
  }

  const removeSection = (index: number) => {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) })
  }

  const updateSectionTitle = (index: number, title: string) => {
    const next = [...form.sections]
    next[index].title = title
    setForm({ ...form, sections: next })
  }

  // --- LOGIC: Resources ---
  const addResource = (sIdx: number) => {
    const next = [...form.sections]
    next[sIdx].resources.push({ title: "", link: "" })
    setForm({ ...form, sections: next })
  }

  const updateResource = (sIdx: number, rIdx: number, field: keyof ResourceDraft, val: string) => {
    const next = [...form.sections]
    next[sIdx].resources[rIdx][field] = val
    setForm({ ...form, sections: next })
  }

  const removeResource = (sIdx: number, rIdx: number) => {
    const next = [...form.sections]
    next[sIdx].resources = next[sIdx].resources.filter((_, i) => i !== rIdx)
    setForm({ ...form, sections: next })
  }

  // --- 🔥 LOGIC: MCQ Questions ---
  const addQuestion = (sIdx: number) => {
    const next = [...form.sections]
    next[sIdx].questions.push({
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0
    })
    setForm({ ...form, sections: next })
  }

  const updateQuestionText = (sIdx: number, qIdx: number, val: string) => {
    const next = [...form.sections]
    next[sIdx].questions[qIdx].questionText = val
    setForm({ ...form, sections: next })
  }

  const updateQuestionOption = (sIdx: number, qIdx: number, oIdx: number, val: string) => {
    const next = [...form.sections]
    next[sIdx].questions[qIdx].options[oIdx] = val
    setForm({ ...form, sections: next })
  }

  const updateCorrectOption = (sIdx: number, qIdx: number, oIdx: number) => {
    const next = [...form.sections]
    next[sIdx].questions[qIdx].correctOptionIndex = oIdx
    setForm({ ...form, sections: next })
  }

  const removeQuestion = (sIdx: number, qIdx: number) => {
      const next = [...form.sections];
      if (next[sIdx].questions.length <= 1) {
        return alert("Every section must have at least one gatekeeper question.");
      }
      next[sIdx].questions = next[sIdx].questions.filter((_, i) => i !== qIdx);
      setForm({ ...form, sections: next });
    };

  // --- SUBMIT ---
  const handlePublish = async () => {
    // 1. Root Validation
    if (!form.title.trim()) return alert("Your collection needs a title!");
    if (!form.description.trim()) return alert("Please add a description!");
    if (form.sections.length === 0) return alert("Add at least one section!");

    // 2. Deep Validation
    for (let i = 0; i < form.sections.length; i++) {
      const section = form.sections[i];
      const sName = `Section ${i + 1} ("${section.title || 'Untitled'}")`;

      if (!section.title.trim()) return alert(`${sName} is missing a title!`);
      
      // Resources Check
      if (!section.resources?.length) return alert(`${sName} needs at least one resource.`);
      const invalidRes = section.resources.some(r => !r.title.trim() || !r.link.trim());
      if (invalidRes) return alert(`All resources in ${sName} must have a title and a URL.`);

      // 🔥 Mandatory Exam Check
      if (!section.questions?.length) {
        return alert(`${sName} requires a Gatekeeper Exam. Add at least one question!`);
      }

      // Questions Content Check
      for (let j = 0; j < section.questions.length; j++) {
        const q = section.questions[j];
        const qName = `Question ${j + 1} in ${sName}`;

        if (!q.questionText.trim()) return alert(`${qName} text is empty!`);
        if (q.options.some(opt => !opt.trim())) return alert(`${qName} has empty options!`);
      }
    }

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
      console.error(err);
      alert("Network error. Please try again.");
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
      // 🔥 Mandatory Exam Check: Must have at least 1 question, and all questions must be filled
      s.questions.length > 0 && 
      s.questions.every(q => 
        q.questionText.trim() !== "" && 
        q.options.every(o => o.trim() !== "")
      )
    );

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      {/* 🚀 STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-[#0b0b0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-white transition text-sm font-bold">
              ← Back
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-lg font-black tracking-tight">Collection <span className="text-purple-500">Studio</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handlePublish}
              disabled={loading || !isFormValid}
              className={`px-6 py-2 rounded-xl font-black text-sm transition transition-all duration-300
                ${isFormValid 
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95" 
                  : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"}
                ${loading ? "opacity-50" : "opacity-100"}`}
            >
              {loading ? "Stashing..." : isFormValid ? "Publish Collection" : "Complete All Fields"}
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
              placeholder="Collection Title (e.g. Linux System Programming)"
              className="w-full bg-transparent text-5xl font-black placeholder:text-white/10 outline-none border-none focus:ring-0"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea 
              placeholder="Give your collection a description. What will people learn?"
              rows={2}
              className="w-full bg-transparent text-xl text-gray-500 placeholder:text-white/10 outline-none border-none focus:ring-0 resize-none"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </section>

          <div className="h-px bg-white/5" />

          {/* SECTIONS LIST */}
          <section className="space-y-8 pb-32">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">Curriculum Structure</h2>
              <button 
                onClick={addSection}
                className="text-xs font-bold px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition"
              >
                + New Section
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
                    className="relative group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* Section Header */}
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-black text-xs">
                        {sIdx + 1}
                      </div>
                      <input 
                        placeholder="Section Title..."
                        value={section.title}
                        className="flex-1 bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-purple-500 transition"
                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                      />
                      <button 
                        onClick={() => removeSection(sIdx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Resources List */}
                    <div className="space-y-4 pl-12 border-l-2 border-white/5 mb-8">
                      {section.resources.map((res, rIdx) => (
                        <motion.div key={rIdx} layout className="flex gap-4 items-center">
                          <input 
                            placeholder="Resource Name"
                            value={res.title}
                            className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl text-sm text-white focus:border-purple-500/50 outline-none"
                            onChange={(e) => updateResource(sIdx, rIdx, 'title', e.target.value)}
                          />
                          <input 
                            placeholder="URL"
                            value={res.link}
                            className="flex-[2] bg-white/5 border border-white/5 p-3 rounded-xl text-sm text-gray-400 focus:border-purple-500/50 outline-none"
                            onChange={(e) => updateResource(sIdx, rIdx, 'link', e.target.value)}
                          />
                          <button 
                            onClick={() => removeResource(sIdx, rIdx)}
                            className="text-gray-700 hover:text-red-400 transition"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                      
                      <button 
                        onClick={() => addResource(sIdx)}
                        className="mt-2 text-xs font-black uppercase text-purple-500/60 hover:text-purple-400 transition tracking-widest"
                      >
                        + Add Link to {section.title || "Section"}
                      </button>
                    </div>

                    {/* 🔥 SECTION MCQ EXAM BUILDER */}
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4 pl-12">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                          Section Gatekeeper Exam
                        </h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(sIdx)}
                          className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition"
                        >
                          + Add MCQ Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {section.questions?.map((q, qIdx) => (
                          <div key={qIdx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 relative group/question">
                            <div className="flex justify-between items-center gap-4">
                              <input
                                placeholder={`Question ${qIdx + 1}: e.g. What is the execution time?`}
                                value={q.questionText}
                                className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-sm text-white outline-none focus:border-orange-500/40"
                                onChange={(e) => updateQuestionText(sIdx, qIdx, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeQuestion(sIdx, qIdx)}
                                // 🔥 Hide remove button if it's the only question left
                                className={`${section.questions.length <= 1 ? 'hidden' : 'flex'} text-gray-500 hover:text-red-400 text-xs font-bold`}
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3 bg-black/20 px-3 py-2 rounded-xl border border-white/5 focus-within:border-orange-500/20">
                                  <input
                                    type="radio"
                                    name={`correct-${sIdx}-${qIdx}`}
                                    checked={q.correctOptionIndex === oIdx}
                                    onChange={() => updateCorrectOption(sIdx, qIdx, oIdx)}
                                    className="accent-orange-500 cursor-pointer w-4 h-4"
                                  />
                                  <input
                                    placeholder={`Option ${oIdx + 1}`}
                                    value={opt}
                                    className="bg-transparent text-xs text-white outline-none flex-1 placeholder:text-gray-600"
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

      {/* SUBTLE BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}