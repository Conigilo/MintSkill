'use client'

import { createPortal } from 'react-dom'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'
import type { SkillWithScore, QuizStatus } from '@/lib/types'

interface SkillQuizModalProps {
  skill: SkillWithScore
  questions: Array<{ q: string; opts: string[]; a: number; explanation?: string }>
  questionIndex: number
  currentScore: number
  status: QuizStatus
  selectedOption: number | null
  onAnswer: (optionIndex: number) => void
  onNext: () => void
  onClose: () => void
}

/**
 * Focus Mode Quiz — แสดง quiz เต็มจอ
 * แยกจาก SkillsTab.tsx เพื่อลดขนาดไฟล์
 */
export default function SkillQuizModal({
  skill,
  questions,
  questionIndex,
  currentScore,
  status,
  selectedOption,
  onAnswer,
  onNext,
  onClose,
}: SkillQuizModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[150] flex flex-col bg-slate-50 dark:bg-[#0d1117] animate-in fade-in duration-300 select-none">
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 py-8 justify-center">
        {/* Header Bar */}
        <div className="flex items-center justify-between shrink-0 px-4 py-5 bg-transparent border-b border-slate-200/40 dark:border-[#21262d]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg mr-1.5 shrink-0">
              AI Quiz
            </span>
            {/* Dynamic Logo Box in Modal Header */}
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#21262d] flex items-center justify-center p-1 shrink-0 overflow-hidden border border-slate-200/50 dark:border-[#30363d]">
              <img
                src={getSkillLogoUrl(skill.name)}
                alt={skill.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback-modal");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <div className="logo-fallback-modal hidden font-black text-[9px] text-slate-400 dark:text-[#8b949e] select-none">
                {skill.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
              {skill.name} Challenge
            </h3>
          </div>
          <button
            onClick={() => {
              if (confirm("คุณต้องการยกเลิกแบบทดสอบหรือไม่? ความคืบหน้าทั้งหมดจะไม่ถูกบันทึก")) {
                onClose()
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-500 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-white transition-all font-bold shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Quiz Mode Progress Bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-[#21262d] shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${(questionIndex / 10) * 100}%` }}
          />
        </div>

        {/* Quiz Body */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-500 dark:text-[#8b949e] font-bold uppercase tracking-wider">Question {questionIndex + 1} of 10</span>
              <span className="text-xs text-blue-500 dark:text-blue-400 font-bold">Score: {currentScore} / 10</span>
            </div>

            <p className="text-slate-900 dark:text-white font-semibold mb-6 text-lg leading-relaxed">{questions[questionIndex]?.q}</p>

            <div className="space-y-3">
              {questions[questionIndex]?.opts.map((option: string, index: number) => {
                const isCorrect = index === questions[questionIndex].a;
                const isSelected = index === selectedOption;
                const hasAnswered = status !== "idle";

                let btnClass = "w-full text-left px-5 py-4 rounded-2xl border-2 transition-all flex justify-between items-center group font-medium ";

                if (!hasAnswered) {
                  btnClass += "bg-white border-slate-200 text-slate-800 hover:border-blue-500 hover:bg-blue-50/10 dark:bg-[#161b22] dark:border-[#30363d] dark:text-[#c9d1d9] dark:hover:border-blue-500 dark:hover:bg-[#1f242c]";
                } else {
                  if (isCorrect) {
                    btnClass += "bg-emerald-50 border-emerald-400 text-emerald-950 dark:bg-[#11271b] dark:border-emerald-600 dark:text-[#a3ebb1] ring-2 ring-emerald-100 dark:ring-emerald-900/30";
                  } else if (isSelected) {
                    btnClass += "bg-rose-50 border-rose-400 text-rose-950 dark:bg-[#2b171c] dark:border-rose-600 dark:text-[#ff9b9b] ring-2 ring-rose-100 dark:ring-rose-900/30";
                  } else {
                    btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-40 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#484f58]";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => onAnswer(index)}
                    disabled={hasAnswered}
                    className={btnClass}
                  >
                    <span className="flex-1">{option}</span>
                    {hasAnswered && isCorrect && (
                      <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <svg className="w-6 h-6 text-rose-500 dark:text-rose-400 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {status !== "idle" && status !== "finished" && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className={`p-5 rounded-2xl border-l-4 ${
                  status === "correct"
                    ? "bg-emerald-50/50 border-emerald-500 text-emerald-950 dark:bg-[#11271b]/50 dark:border-emerald-600 dark:text-[#a3ebb1]"
                    : "bg-rose-50/50 border-rose-500 text-rose-950 dark:bg-[#2b171c]/50 dark:border-rose-600 dark:text-[#ff9b9b]"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-extrabold text-sm ${status === "correct" ? "text-emerald-800 dark:text-[#a3ebb1]" : "text-rose-800 dark:text-[#ff9b9b]"}`}>
                      {status === "correct" ? "✓ ถูกต้อง" : "✗ ยังไม่ถูกนะ"}
                    </span>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {status === "correct"
                      ? (questions[questionIndex]?.explanation || "คำตอบของคุณถูกต้องแล้ว!")
                      : (questions[questionIndex]?.explanation || `คำตอบที่ถูกต้องคือ: ${questions[questionIndex]?.opts[questions[questionIndex].a]}`)}
                  </p>
                </div>

                <button
                  onClick={onNext}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 group"
                >
                  {questionIndex + 1 === 10 ? "ส่งคำตอบและดูผลลัพธ์" : "ข้อถัดไป"}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {status === "finished" && (
              <div className="mt-8 p-8 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-3xl text-center shadow-xl animate-in zoom-in-95 duration-300 max-w-md mx-auto flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 dark:border-blue-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <span className="text-xl">🤖</span>
                </div>
                <h4 className="text-slate-900 dark:text-white font-extrabold text-lg mb-2">กำลังประมวลผลและส่งคะแนน...</h4>
                <p className="text-slate-500 dark:text-[#8b949e] text-sm mb-1">
                  คุณทำคะแนนได้ <span className="text-blue-500 font-black text-base">{currentScore} / 10</span> คะแนน
                </p>
                <p className="text-xs text-slate-400 dark:text-[#6e7681] mt-2">
                  ระบบกำลังอัปเดตระดับความสามารถของคุณ โปรดรอสักครู่
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    , document.body
  )
}
