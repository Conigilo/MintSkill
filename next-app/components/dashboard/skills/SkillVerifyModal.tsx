'use client'

import { createPortal } from 'react-dom'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'
import { getCurrentLevel } from '@/lib/utils/level'
import type { SkillWithScore } from '@/lib/types'

interface SkillVerifyModalProps {
  skill: SkillWithScore
  isGeneratingQuiz: boolean
  onClose: () => void
  onStartQuiz: () => void
  onNavigateToEndorse?: () => void
  onShowBadge: (skillId: string) => void
}

/**
 * SkillVerifyModal - หน้าต่างตรวจสอบและอัปเกรดทักษะ ดีไซน์ใหม่พรีเมียม สไตล์ Glassmorphism (ไม่มีแสงเรืองแสง/กะพริบ)
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

  // คำนวณความคืบหน้าของคะแนน (Progress Percentage)
  const endoTarget = currentLvl.level === 3 ? 5 : (currentLvl.nextEndorse || 5)
  const endoPercent = Math.min(100, (skill.endorsementScore / endoTarget) * 100)

  const quizTarget = currentLvl.level === 3 ? 10 : (currentLvl.nextQuiz || 10)
  const quizPercent = Math.min(100, (skill.quizScore / quizTarget) * 100)

  // สไตล์สีตามระดับเป้าหมาย
  const GOAL_THEME = {
    3: { text: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    2: { text: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    1: { text: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10" },
    0: { text: "text-slate-500", border: "border-slate-500/20", bg: "bg-slate-500/10" }
  }[(currentLvl.level < 3 ? currentLvl.level + 1 : 3) as 0 | 1 | 2 | 3];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 select-none animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="bg-white/80 dark:bg-[#0d1117]/95 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between shrink-0 px-6 py-4 bg-white/40 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            {/* Dynamic Logo Box */}
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center p-1.5 shrink-0 overflow-hidden border border-slate-200/50 dark:border-white/5">
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
              <div className="logo-fallback-modal hidden font-black text-[10px] text-slate-500 dark:text-[#8b949e] select-none">
                {skill.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">
              Verify & Upgrade {skill.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-bold text-xs"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
          
          {/* Level Transition Indicator Card */}
          <div className="bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-4.5 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Current Level</span>
              <strong className="text-slate-900 dark:text-white text-base">{currentLvl.name} (Lvl {currentLvl.level})</strong>
            </div>
            
            {currentLvl.level < 3 ? (
              <>
                {/* Step indicator arrow (ไม่มีการกะพริบ animate-pulse) */}
                <div className={`w-8 h-8 rounded-full ${GOAL_THEME.bg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${GOAL_THEME.text}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Next Target</span>
                  <strong className={`${GOAL_THEME.text} text-base font-extrabold`}>
                    {currentLvl.level === 0 && "Junior"}
                    {currentLvl.level === 1 && "Mid"}
                    {currentLvl.level === 2 && "Senior"}
                    <span className="text-xs font-semibold ml-1">(Lvl {currentLvl.level + 1})</span>
                  </strong>
                </div>
              </>
            ) : (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 font-extrabold border border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                🏆 Max level reached
              </span>
            )}
          </div>

          {/* Verification requirements grid */}
          <div className="space-y-4">
            
            {/* Requirement 1: Endorsement */}
            <div className="bg-white/50 dark:bg-[#161b22]/40 p-4.5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm">Endorsement Verification</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {currentLvl.level === 3 ? "ยืนยันการรับรองครบสมบูรณ์แล้ว" : `ต้องการอีก ${Math.max(0, currentLvl.nextEndorse! - skill.endorsementScore)} ผู้รับรองเพื่อเลื่อนขั้น`}
                  </p>
                </div>
                <span className="text-base font-black text-emerald-500 dark:text-emerald-400 font-mono">
                  {skill.endorsementScore}<span className="text-xs text-slate-400">/{currentLvl.level === 3 ? 5 : currentLvl.nextEndorse}</span>
                </span>
              </div>
              
              {/* Progress bar (ไม่มีเงาเรืองแสง) */}
              <div className="flex items-center gap-4 mt-1">
                <div className="flex-1 bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${endoPercent}%` }}
                  />
                </div>
                {currentLvl.level < 3 && (
                  <button
                    className="shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95"
                    onClick={() => {
                      onClose()
                      if (onNavigateToEndorse) onNavigateToEndorse()
                    }}
                  >
                    ขอ Endorse
                  </button>
                )}
              </div>
            </div>

            {/* Requirement 2: Quiz */}
            <div className="bg-white/50 dark:bg-[#161b22]/40 p-4.5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm">Quiz Examination</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {currentLvl.level === 3 ? "สอบควิซระดับสูงสุดเรียบร้อยแล้ว" : `ทำคะแนนให้ได้ ${currentLvl.nextQuiz} คะแนนขึ้นไป`}
                  </p>
                </div>
                <span className="text-base font-black text-blue-500 dark:text-blue-400 font-mono">
                  {skill.quizScore}<span className="text-xs text-slate-400">/{currentLvl.level === 3 ? 10 : currentLvl.nextQuiz}</span>
                </span>
              </div>
              
              {/* Progress bar (ไม่มีเงาเรืองแสง) */}
              <div className="flex items-center gap-4 mt-1">
                <div className="flex-1 bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${quizPercent}%` }}
                  />
                </div>
                <button
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 border flex items-center justify-center min-w-[90px] ${
                    currentLvl.level === 3 || isGeneratingQuiz 
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 cursor-not-allowed' 
                      : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}
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

          {/* Success Banner Area (Show badge upgrade CTA if passed - ไม่มีเงาเรืองแสง) */}
          {currentLvl.level > 0 && (
            <div className="mt-6 text-center p-5 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl animate-in zoom-in-95 duration-300">
              <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm mb-3">
                🎉 Congratulations! You have passed for Level {currentLvl.level}
              </p>
              <button
                onClick={() => {
                  onClose()
                  onShowBadge(skill.id)
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
              >
                Claim {currentLvl.name} Badge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    , document.body
  )
}
