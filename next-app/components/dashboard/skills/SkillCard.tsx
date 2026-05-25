'use client'

import { getSkillLogoUrl } from '@/lib/utils/skill-logo'
import { getCurrentLevel } from '@/lib/utils/level'
import type { SkillWithScore } from '@/lib/types'

interface SkillCardProps {
  skill: SkillWithScore
  onVerify: (skillId: string) => void
  onBadge: (skillId: string) => void
  onDelete: (skillId: string) => void
}

export default function SkillCard({ skill, onVerify, onBadge, onDelete }: SkillCardProps) {
  const currentLvl = getCurrentLevel(skill.quizScore, skill.endorsementScore)
  const progress = skill.verified
    ? (currentLvl.level === 3 ? 100 : currentLvl.level === 2 ? 75 : currentLvl.level === 1 ? 50 : 25)
    : 0

  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between
        ${skill.verified
          ? "bg-white dark:bg-[#161b22] border-slate-200/80 dark:border-[#30363d] hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-md"
          : "bg-slate-50/50 dark:bg-[#0d1117]/30 border-slate-200 dark:border-[#30363d] border-dashed text-slate-400 dark:text-[#8b949e] hover:border-blue-500/40 hover:bg-slate-100/50 dark:hover:bg-[#161b22]/50 hover:-translate-y-1"
        }`}
      onClick={() => {
        if (!skill.verified) {
          onVerify(skill.id)
        } else {
          onBadge(skill.id)
        }
      }}
    >
      {/* Top Row: Name and Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Dynamic Logo Box */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#21262d] flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative border border-slate-200/50 dark:border-[#30363d]">
            <img
              src={getSkillLogoUrl(skill.name)}
              alt={skill.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback");
                if (fallback) fallback.classList.remove("hidden");
              }}
            />
            <div className="logo-fallback hidden font-black text-[10px] text-slate-400 dark:text-[#8b949e] select-none">
              {skill.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${skill.verified ? skill.color : 'bg-slate-400 dark:bg-slate-600'}`}></span>
              <span className={`font-bold text-sm truncate ${skill.verified ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-[#8b949e]"}`}>
                {skill.name}
              </span>
            </div>
          </div>
        </div>

        {skill.verified ? (
          <span className="text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
            {currentLvl.name}
          </span>
        ) : (
          <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
            Verify
          </span>
        )}
      </div>

      {/* Middle: Progress and Details */}
      <div className="mt-4 space-y-3">
        {skill.verified ? (
          <>
            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span>LEVEL {currentLvl.level}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${skill.color || 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {/* Small stat counters */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1">⭐ Quiz: {skill.quizScore}/10</span>
              <span className="flex items-center gap-1">👍 Endorse: {skill.endorsementCount}/{currentLvl.level === 3 ? 2 : currentLvl.level === 2 ? 2 : 1}</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-400 dark:text-[#8b949e] leading-relaxed">
              ยังไม่ได้ยืนยันความสามารถ กดปุ่มเพื่อทำคำท้าทาย
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 hover:underline">
                เริ่มทำแบบทดสอบ →
              </span>
              {/* Delete button inside unverified card */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete ${skill.name}?`)) {
                    onDelete(skill.id);
                  }
                }}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-[#21262d] p-1.5 rounded-lg transition-colors"
                title="Delete skill"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
