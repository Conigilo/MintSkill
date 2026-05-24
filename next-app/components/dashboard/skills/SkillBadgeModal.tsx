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
 * Badge Certificate Modal — แสดงใบรับรอง badge ของ skill
 * แยกจาก SkillsTab.tsx
 */
export default function SkillBadgeModal({ skill, onClose, onUpgrade }: SkillBadgeModalProps) {
  const currentLvl = getCurrentLevel(skill.quizScore, skill.endorsementScore)
  const credId = `skw-${String(skill.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Skill Certificate</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] flex items-center justify-center shadow-lg relative mb-4 p-4">
            <img
              src={getSkillLogoUrl(skill.name)}
              alt={skill.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback-modal-large");
                if (fallback) fallback.classList.remove("hidden");
              }}
            />
            <div className="logo-fallback-modal-large hidden font-black text-2xl text-slate-700 dark:text-[#8b949e] select-none">
              {skill.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 dark:border-slate-900 border-[#0d1117] w-6 h-6 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{skill.name}</h3>
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1">Level {currentLvl.level} ({currentLvl.name})</p>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden">
            <div className="flex bg-white dark:bg-slate-700 border-b border-slate-200/50 dark:border-slate-600/50">
              <div className="flex-1 text-center border-r border-slate-200/50 dark:border-slate-600/50 p-3">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total</p>
                <p className="text-lg text-green-500 dark:text-green-400 font-black">{Math.min(15, skill.quizScore + skill.endorsementScore)}<span className="text-xs text-slate-400 dark:text-slate-500">/15</span></p>
              </div>
              <div className="flex-1 text-center border-r border-slate-200/50 dark:border-slate-600/50 p-3">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">Endorse</p>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-bold">{Math.min(5, skill.endorsementScore)}<span className="text-xs text-slate-400 dark:text-slate-500">/5</span></p>
              </div>
              <div className="flex-1 text-center p-3">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">Quiz</p>
                <p className="text-lg text-slate-800 dark:text-slate-200 font-bold">{Math.min(10, skill.quizScore)}<span className="text-xs text-slate-400 dark:text-slate-500">/10</span></p>
              </div>
            </div>
          </div>

          {currentLvl.level < 3 && (
            <button
              onClick={() => onUpgrade(skill.id)}
              className="w-full mt-4 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Do Challenge to Upgrade Badge
            </button>
          )}
        </div>
      </div>
    </div>
    , document.body
  )
}
