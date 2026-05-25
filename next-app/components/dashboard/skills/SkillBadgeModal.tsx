'use client'

import { createPortal } from 'react-dom'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'
import { getCurrentLevel } from '@/lib/utils/level'
import type { SkillWithScore } from '@/lib/types'

interface SkillBadgeModalProps {
  skill: SkillWithScore
  onClose: () => void
  onUpgrade: (skillId: string) => void
}

/**
 * SkillBadgeModal - แสดงใบรับรองทักษะ (Skill Certificate) ดีไซน์ใหม่พรีเมียม สไตล์ Glassmorphism (ไม่มีแสงเรืองแสง/กะพริบ)
 */
export default function SkillBadgeModal({ skill, onClose, onUpgrade }: SkillBadgeModalProps) {
  const currentLvl = getCurrentLevel(skill.quizScore, skill.endorsementScore)
  const credId = `skw-${String(skill.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`

  // สไตล์สำหรับแต่ละระดับเลเวล (Beginner, Junior, Mid, Senior) เพื่อความพรีเมียม (ไม่มี Glow Effect)
  const LEVEL_STYLES = {
    3: { 
      bg: "from-amber-500/20 to-orange-500/20", 
      border: "border-amber-500/30 dark:border-amber-500/40", 
      text: "text-amber-600 dark:text-amber-400", 
      badgeBg: "bg-gradient-to-r from-amber-500 to-orange-600",
      badgeText: "Senior Expert Badge",
      cardBg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15"
    },
    2: { 
      bg: "from-emerald-500/20 to-teal-500/20", 
      border: "border-emerald-500/30 dark:border-emerald-500/40", 
      text: "text-emerald-600 dark:text-emerald-400", 
      badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
      badgeText: "Mid Professional Badge",
      cardBg: "bg-emerald-500/5 dark:bg-[#161b22]/40 border-emerald-500/15"
    },
    1: { 
      bg: "from-blue-500/20 to-indigo-500/20", 
      border: "border-blue-500/30 dark:border-blue-500/40", 
      text: "text-blue-600 dark:text-blue-400", 
      badgeBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      badgeText: "Junior Associate Badge",
      cardBg: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/15"
    },
    0: { 
      bg: "from-slate-500/20 to-gray-500/20", 
      border: "border-slate-500/30 dark:border-slate-500/40", 
      text: "text-slate-600 dark:text-slate-400", 
      badgeBg: "bg-gradient-to-r from-slate-500 to-gray-600",
      badgeText: "Beginner Explorer Badge",
      cardBg: "bg-slate-500/5 dark:bg-slate-500/10 border-slate-500/15"
    }
  }[currentLvl.level as 0 | 1 | 2 | 3] || { 
    bg: "from-slate-500/20 to-gray-500/20", 
    border: "border-slate-500/30", 
    text: "text-slate-600 dark:text-slate-400", 
    badgeBg: "bg-slate-500", 
    badgeText: "Beginner",
    cardBg: "bg-slate-500/5"
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative bg-white/85 dark:bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/40 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Verified Skill Certificate
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Certificate Card Body */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 relative">
          
          {/* Badge Medal (เอาเงาสะท้อนเรืองแสงและ Glow shadowออก) */}
          <div className={`relative w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-white/20 to-white/5 border ${LEVEL_STYLES.border} flex items-center justify-center mb-5 group transition-transform duration-500 hover:scale-105`}>
            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#161b22] flex items-center justify-center p-5 relative overflow-hidden">
              {/* Dynamic backdrop gradient */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${LEVEL_STYLES.bg} opacity-50 blur-sm`} />
              
              <img
                src={getSkillLogoUrl(skill.name)}
                alt={skill.name}
                className="w-14 h-14 object-contain relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback-modal-large");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <div className="logo-fallback-modal-large hidden font-black text-3xl text-slate-700 dark:text-[#8b949e] select-none z-10">
                {skill.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Verification check mark badge */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white dark:border-[#0d1117] w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{skill.name}</h3>
          
          {/* Level Badge label */}
          <span className={`mt-2 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${LEVEL_STYLES.badgeBg} text-white shadow-sm`}>
            {LEVEL_STYLES.badgeText}
          </span>
          
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-mono mt-3 uppercase tracking-wider">
            CREDENTIAL ID: <span className="text-slate-600 dark:text-slate-300 font-bold">{credId}</span>
          </p>
        </div>

        {/* Info Grid Section (Glassmorphism Stats Cards) */}
        <div className="px-6 pb-6">
          <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 mb-6 overflow-hidden">
            <div className="flex bg-white/30 dark:bg-white/5 backdrop-blur-md">
              <div className="flex-1 text-center border-r border-slate-200/50 dark:border-white/5 p-3.5">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Total</p>
                <p className="text-lg text-emerald-500 dark:text-emerald-400 font-black">
                  {Math.min(15, skill.quizScore + skill.endorsementScore)}
                  <span className="text-xs text-slate-400 dark:text-slate-500">/15</span>
                </p>
              </div>
              <div className="flex-1 text-center border-r border-slate-200/50 dark:border-white/5 p-3.5">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Endorse</p>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-extrabold">
                  {Math.min(5, skill.endorsementScore)}
                  <span className="text-xs text-slate-400 dark:text-slate-500">/5</span>
                </p>
              </div>
              <div className="flex-1 text-center p-3.5">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Quiz</p>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-extrabold">
                  {Math.min(10, skill.quizScore)}
                  <span className="text-xs text-slate-400 dark:text-slate-500">/10</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          {currentLvl.level < 3 ? (
            <button
              onClick={() => onUpgrade(skill.id)}
              className={`w-full py-4 rounded-xl text-xs font-extrabold tracking-wider uppercase text-white bg-gradient-to-r ${LEVEL_STYLES.badgeBg} hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5`}
            >
              Do Challenge to Upgrade Badge
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl text-center text-xs font-bold bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/5 border border-emerald-500/20">
              🏆 Completed All Badge Challenges
            </div>
          )}
        </div>
      </div>
    </div>
    , document.body
  )
}
