'use client'

import { createPortal } from 'react-dom'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'
import { getCurrentLevel } from '@/lib/utils/level'
import type { SkillWithScore, QuizStatus } from '@/lib/types'
import { skillsService } from '@/lib/services/skills.service'

interface SkillVerifyModalProps {
  skill: SkillWithScore
  isGeneratingQuiz: boolean
  onClose: () => void
  onStartQuiz: () => void
  onNavigateToEndorse?: () => void
  onShowBadge: (skillId: string) => void
}

/**
 * Modal แสดงข้อมูลระดับทักษะ + ปุ่มเริ่ม Quiz + ปุ่มขอ Endorse
 * แยกจาก SkillsTab.tsx เพื่อลดขนาดไฟล์
 */
export default function SkillVerifyModal({
  skill,
  isGeneratingQuiz,
  onClose,
  onStartQuiz,
  onNavigateToEndorse,
  onShowBadge,
}: SkillVerifyModalProps) {
  const currentLvl = getCurrentLevel(skill.quizScore, skill.endorsementScore)

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-right-10 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between shrink-0 px-6 py-4 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-[#30363d] rounded-t-3xl">
          <div className="flex items-center gap-2">
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
              Verify {skill.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-500 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-white transition-all font-bold shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6 bg-white border border-slate-200 p-4 rounded-xl">
            <p className="text-sm text-slate-500">
              Level ปัจจุบัน: <strong className="text-slate-900 text-lg ml-2">{currentLvl.name} (Level {currentLvl.level})</strong>
            </p>
            {currentLvl.level < 3 && (
              <span className="text-[11px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                เป้าหมาย: Level {currentLvl.level + 1}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Activity 1: Endorsement */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-slate-900 font-semibold text-sm mb-1">Endorsement</h4>
                <p className="text-xs text-slate-400">
                  {currentLvl.level === 3 ? "ระดับสูงสุดแล้ว" : `ต้องการอีก ${Math.max(0, currentLvl.nextEndorse! - skill.endorsementScore)} คนเพื่ออัปเลเวล`}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-lg font-bold text-green-400 mb-1">{skill.endorsementScore} / {currentLvl.level === 3 ? "5" : currentLvl.nextEndorse}</span>
                <button
                  className="bg-green-600/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-xs hover:bg-green-600/20 transition"
                  onClick={() => {
                    onClose()
                    if (onNavigateToEndorse) onNavigateToEndorse()
                  }}
                >
                  ขอ Endorse
                </button>
              </div>
            </div>

            {/* Activity 2: Quiz */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-slate-900 font-semibold text-sm mb-1">Quiz</h4>
                <p className="text-xs text-slate-400">
                  {currentLvl.level === 3 ? "ระดับสูงสุดแล้ว" : `ทำให้ได้ ${currentLvl.nextQuiz} ขึ้นไป`}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-lg font-bold text-cyan-400 mb-1">{skill.quizScore} / {currentLvl.level === 3 ? "10" : currentLvl.nextQuiz}</span>
                <button
                  className={`px-3 py-1 rounded-lg text-xs transition border flex items-center justify-center min-w-[90px] ${currentLvl.level === 3 || isGeneratingQuiz ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed' : 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-600/20'}`}
                  disabled={currentLvl.level === 3 || isGeneratingQuiz}
                  onClick={onStartQuiz}
                >
                  {isGeneratingQuiz ? (
                    <svg className="animate-spin h-3.5 w-3.5 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isGeneratingQuiz ? 'AI...' : 'เริ่มทำควิซ'}
                </button>
              </div>
            </div>
          </div>

          {currentLvl.level > 0 && (
            <div className="mt-8 text-center p-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-in zoom-in-95">
              <p className="text-green-400 font-bold mb-3">You are pass for {currentLvl.name} Level {currentLvl.level}</p>
              <button
                onClick={() => {
                  onClose()
                  onShowBadge(skill.id)
                }}
                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
              >
                Get {currentLvl.name} Badge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    , document.body
  )
}
