'use client'

import { getSkillLogoUrl } from '@/lib/utils/skill-logo'

interface SkillGapCardProps {
  name: string
  myLevel: number
  req: number
  gap: number
  isReady: boolean
  details: {
    topics: string[]
    project: string
    difficulty: string
    diffColor: string
  } | undefined
  resourceLink: string | undefined
  isExpanded: boolean
  onToggle: () => void
}

export default function SkillGapCard({
  name,
  myLevel,
  req,
  gap,
  isReady,
  details,
  resourceLink,
  isExpanded,
  onToggle,
}: SkillGapCardProps) {
  // Determine clean status properties
  let statusText = ''
  let statusDotColor = ''
  let progressBgColor = ''
  let gapColor = ''

  if (isReady) {
    statusText = 'พร้อมแล้ว'
    statusDotColor = 'bg-emerald-500'
    progressBgColor = 'bg-emerald-500'
    gapColor = 'bg-transparent'
  } else if (gap <= 15) {
    statusText = `ขาดอีก ${gap}% (ใกล้เคียง)`
    statusDotColor = 'bg-amber-500'
    progressBgColor = 'bg-amber-500'
    gapColor = 'bg-amber-200/40 dark:bg-amber-500/10'
  } else {
    statusText = `ขาดอีก ${gap}%`
    statusDotColor = 'bg-rose-500'
    progressBgColor = 'bg-rose-500'
    gapColor = 'bg-rose-100 dark:bg-rose-500/10'
  }

  return (
    <div
      className={`group bg-white dark:bg-[#161b22] border rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded
          ? 'border-slate-300 dark:border-slate-700 shadow-sm'
          : 'border-slate-200/80 dark:border-[#30363d] hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Header Area */}
      <div
        onClick={onToggle}
        className="p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Skill Logo */}
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#21262d] flex items-center justify-center p-1.5 border border-slate-200/50 dark:border-[#30363d] shrink-0">
            <img
              src={getSkillLogoUrl(name)}
              alt={name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="logo-fallback hidden font-bold text-[9px] text-slate-400 dark:text-[#8b949e]">
              {name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                {name}
              </span>
              {details && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${details.diffColor} scale-95`}>
                  {details.difficulty}
                </span>
              )}
            </div>
            {/* Status description */}
            <p className="text-[11px] text-slate-400 dark:text-[#8b949e] mt-0.5 font-medium">
              {isReady ? (
                <span className="text-emerald-500 font-bold">ระดับของคุณครบเกณฑ์ที่กำหนดแล้ว</span>
              ) : (
                <span>ระดับของคุณ {myLevel}% / ต้องการ {req}%</span>
              )}
            </p>
          </div>
        </div>

        {/* Status Indicator Dot & Expander Arrow */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-[#30363d]">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {statusText}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 dark:text-slate-500 transform transition-transform duration-300 ${
              isExpanded ? 'rotate-180 text-blue-500' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Progress Track (Clean & Minimalist without repeating red stripes) */}
      <div className="px-4 pb-4">
        <div className="relative w-full h-2 bg-slate-100 dark:bg-[#21262d] rounded-full overflow-hidden">
          {/* Target marker (vertical dotted line removed for absolute clarity) */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-slate-400 dark:bg-slate-600 z-30"
            style={{ left: `${req}%` }}
            title={`เป้าหมาย: ${req}%`}
          />
          {/* Current Level progress fill */}
          <div
            className={`absolute top-0 left-0 bottom-0 rounded-full ${progressBgColor} z-20 transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(myLevel, 100)}%` }}
          />
          {/* Gap highlight (plain color tint, no visual noise stripes) */}
          {!isReady && (
            <div
              className={`absolute top-0 bottom-0 ${gapColor} z-10 transition-all duration-700`}
              style={{
                left: `${myLevel}%`,
                width: `${gap}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Expandable Accordion Content */}
      {isExpanded && details && (
        <div className="border-t border-slate-100 dark:border-[#21262d] bg-[#fafbfc]/80 dark:bg-[#121620]/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Focus Topics */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                หัวข้อหลักที่ควรทบทวน
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {details.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 dark:text-slate-300 dark:bg-[#1f242c] dark:border-[#30363d] px-2.5 py-1 rounded-lg"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Project */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                โปรเจกต์แนะนำสำหรับพัฒนาตนเอง
              </h5>
              <div className="bg-white border border-slate-200/60 dark:bg-[#1c212a] dark:border-[#30363d] p-3 rounded-xl shadow-sm text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {details.project}
              </div>
            </div>
          </div>

          {/* Action button */}
          {resourceLink && (
            <div className="pt-1 flex justify-end">
              <a
                href={resourceLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 dark:text-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] border border-slate-200 dark:border-[#30363d] rounded-lg transition-all active:scale-95 shadow-sm"
              >
                ศึกษาเพิ่มเติมออนไลน์
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
