/**
 * GapAnalysisTab — Composition Component
 *
 * ก่อน refactor: 935 บรรทัด (God Component)
 * หลัง refactor: ~480 บรรทัด — แยก static data ไป constants, chart components ออกไป
 *
 * ส่วนที่ยังอยู่ในไฟล์นี้คือ: business logic คำนวณ match + UI layout ของ role selector, stats grid, skill gap cards
 * (ส่วน skill gap cards ไม่ได้แยกเป็น component เพราะมี expanded state ที่ผูกกับ parent)
 */

'use client'

import { useState, useEffect } from 'react'
import { rolesData, skillResources, skillDetails } from '@/lib/constants/gap-analysis-data'
import RadialProgress from '@/components/dashboard/gap-analysis/RadialProgress'
import SkillGapCard from '@/components/dashboard/gap-analysis/SkillGapCard'
import AILearningRoadmap from '@/components/dashboard/gap-analysis/AILearningRoadmap'

interface GapAnalysisTabProps {
  skills: Array<{ name: string; level?: number; quizScore?: number; endorsementScore?: number; [key: string]: any }>
}

export default function GapAnalysisTab({ skills }: GapAnalysisTabProps) {
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer")
  const [activeFilter, setActiveFilter] = useState<"all" | "gaps" | "ready">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [activeRoadmapSkill, setActiveRoadmapSkill] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(false)
    const t = setTimeout(() => setAnimateIn(true), 50)
    return () => clearTimeout(t)
  }, [targetRole, activeFilter, searchQuery])

  // Calculate mySkills object
  const mySkills: Record<string, number> = (skills || []).reduce(
    (acc: Record<string, number>, s) => {
      const quiz = Math.min(10, s.quizScore || 0)
      const endorse = Math.min(5, s.endorsementScore || 0)
      const testScorePercentage = Math.round(((quiz / 10) * 50) + ((endorse / 5) * 50))
      acc[s.name] = (quiz > 0 || endorse > 0) ? testScorePercentage : ((s.level || 0) * 20)
      return acc
    },
    {} as Record<string, number>
  )

  const currentRole = rolesData[targetRole]

  // Calculate match percentage for the selected role
  let totalScore = 0, maxScore = 0
  currentRole.requirements.forEach(req => {
    totalScore += Math.min(mySkills[req.name] || 0, req.req)
    maxScore += req.req
  })
  const matchPercentage = Math.round((totalScore / maxScore) * 100)

  // Compute roles compatibility for selector cards
  const roleMatches = Object.keys(rolesData).reduce((acc, rName) => {
    let t = 0, m = 0
    rolesData[rName].requirements.forEach(req => {
      t += Math.min(mySkills[req.name] || 0, req.req)
      m += req.req
    })
    acc[rName] = Math.round((t / m) * 100)
    return acc
  }, {} as Record<string, number>)

  // Sort and filter requirements
  const sortedReqs = [...currentRole.requirements]
    .map(req => {
      const myLevel = mySkills[req.name] || 0
      const gap = Math.max(0, req.req - myLevel)
      const isReady = gap <= 0
      return { ...req, myLevel, gap, isReady }
    })
    .sort((a, b) => b.gap - a.gap) // Sort largest gap first

  const filteredReqs = sortedReqs.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (activeFilter === "gaps") return !r.isReady
    if (activeFilter === "ready") return r.isReady
    return true
  })

  const readyCount = currentRole.requirements.filter(r => (mySkills[r.name] || 0) >= r.req).length
  const gapCount = currentRole.requirements.length - readyCount

  // Determine Level Tier info
  let tierName = "Apprentice Tier"
  let tierEmoji = "🎯"
  let tierColorClass = "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25"
  let tierText = "ระดับปูพื้นฐาน จำเป็นต้องพัฒนาทักษะเพิ่มเติมเพื่อความพร้อมสูงสุด"

  if (matchPercentage >= 80) {
    tierName = "Platinum Tier"
    tierEmoji = "🏆"
    tierColorClass = "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/15 dark:border-green-500/25"
    tierText = "คุณมีความเหมาะสมอย่างยิ่งยวด มีความรู้พร้อมสำหรับการลุยงานจริงได้ทันที!"
  } else if (matchPercentage >= 60) {
    tierName = "Gold Tier"
    tierEmoji = "🥇"
    tierColorClass = "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/25"
    tierText = "ความพร้อมระดับดี ขาดเพียงทักษะเฉพาะเจาะจงบางจุดที่จะช่วยยกระดับคุณ"
  } else if (matchPercentage >= 35) {
    tierName = "Silver Tier"
    tierEmoji = "🥈"
    tierColorClass = "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/25"
    tierText = "ระดับปานกลาง แนะนำให้เรียนรู้และทำโปรเจกต์เพิ่มเติมในจุดที่ยังมีช่องว่างกว้าง"
  }

  // Dynamic estimate weeks: ~1.5 weeks per 10% gap
  const totalGapValue = sortedReqs.reduce((acc, r) => acc + r.gap, 0)
  const estimatedWeeks = Math.max(1, Math.round(totalGapValue / 15))

  const toggleExpandSkill = (name: string) => {
    setExpandedSkill(expandedSkill === name ? null : name)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 select-none">

      {/* ═══ 1. Role Selection Grid ═══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              เป้าหมายอาชีพ (Target Career)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">เลือกตำแหน่งงานเพื่อวิเคราะห์ความเข้ากันได้ของทักษะของคุณ</p>
          </div>
        </div>

        {/* Horizontal scroll deck of roles */}
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {Object.entries(rolesData).map(([rName, details]) => {
            const isSel = rName === targetRole
            const matchScore = roleMatches[rName] || 0

            return (
              <button
                key={rName}
                onClick={() => setTargetRole(rName)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left min-w-[250px] md:min-w-[280px] flex-1 snap-start transition-all duration-300 outline-none select-none group
                  ${isSel
                    ? 'bg-blue-50/50 border-blue-500 dark:bg-blue-950/20 dark:border-blue-500/80 shadow-[0_4px_20px_rgba(59,130,246,0.08)]'
                    : 'bg-white border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] hover:border-slate-300 dark:hover:border-[#484f58] hover:shadow-sm'
                  }
                `}
              >
                {/* Active Indicator Pin */}
                {isSel && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] font-extrabold tracking-tight ${isSel ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-[#f0f6fc]'}`}>
                      {rName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                    {details.desc}
                  </p>
                </div>

                <div className="w-full mt-auto space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider">
                    <span className="text-slate-400 dark:text-[#8b949e]">เปอร์เซ็นต์ที่ตรง</span>
                    <span className={matchScore >= 80 ? 'text-green-500 dark:text-green-400' : matchScore >= 60 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}>
                      {matchScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        matchScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        matchScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                        'bg-gradient-to-r from-red-400 to-rose-500'
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ 2. Premium Gauge & Stats Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Card: Overall Fit Gauge */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[380px]">
          {/* Subtle Top-Stripe Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

          <div className="w-full flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 mt-2">
              สรุปความพร้อมรวม (Overall Fit)
            </span>
          </div>

          <div className="mb-4 w-full flex justify-center items-center flex-1 py-2">
            <RadialProgress value={matchPercentage} />
          </div>

          <div className="space-y-1 relative z-10 w-full">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${tierColorClass}`}>
              <span>{tierEmoji}</span>
              <span>{tierName}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e] px-4 pt-2 max-w-[280px] mx-auto leading-relaxed">
              {tierText}
            </p>
          </div>
        </div>

        {/* Right Card: Stats Grid */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              รายละเอียดเกณฑ์เปรียบเทียบ
            </span>
            <h3 className="text-[19px] font-bold text-slate-800 dark:text-white mt-1">
              ทักษะสำหรับตำแหน่ง <span className="text-blue-500 dark:text-blue-400">{targetRole}</span>
            </h3>
          </div>

          {/* Stats Box Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#f8fafc] dark:bg-[#0d1117] border border-slate-200/60 dark:border-[#21262d] rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{currentRole.requirements.length}</span>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">ทักษะที่ต้องการ</p>
            </div>
            <div className="bg-green-50/30 dark:bg-green-950/5 border border-green-100 dark:border-[#2e3e2f] rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">{readyCount}</span>
              <p className="text-[9px] font-bold text-green-500 dark:text-green-500 uppercase tracking-widest mt-1">พร้อมแล้ว</p>
            </div>
            <div className="bg-rose-50/30 dark:bg-red-950/5 border border-rose-100 dark:border-[#3e2e2e] rounded-2xl p-4 text-center">
              <span className="text-2xl font-black text-red-500 dark:text-red-400 leading-none">{gapCount}</span>
              <p className="text-[9px] font-bold text-red-400 dark:text-red-500 uppercase tracking-widest mt-1">ต้องพัฒนาเพิ่ม</p>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-[#f8fafc] border border-slate-200/50 dark:bg-[#0d1117] dark:border-[#21262d] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {gapCount === 0 ? (
                <>ยินดีด้วย! คุณมีทักษะระดับสูงครบถ้วนตามเกณฑ์สำหรับตำแหน่ง <strong className="text-slate-800 dark:text-white">{targetRole}</strong> แล้ว</>
              ) : (
                <>คุณมีทักษะพร้อมแล้ว <strong>{readyCount} จาก {currentRole.requirements.length} ด้าน</strong> และต้องการอีกประมาณ <strong>{estimatedWeeks} สัปดาห์</strong> ในการอุดช่องว่างหลักที่เหลืออยู่</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 3. Skill Gap Audit Board ═══ */}
      <div className="bg-white border border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] rounded-3xl p-6 md:p-8">

        {/* Header with Search and Tab Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-[#21262d]">
          <div>
            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              รายงานวิเคราะห์เจาะลึกรายวิชา
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">คลิกที่การ์ดเพื่อขยายดูแผนพัฒนาการเรียนรู้รายบุคคล</p>
          </div>

          <div className="flex flex-col items-end md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อวิชา..."
                className="w-48 bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs font-medium pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Pills */}
            <div className="flex bg-[#f8fafc] dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] p-1 rounded-xl">
              {(["all", "gaps", "ready"] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    activeFilter === filter
                      ? "bg-white text-blue-600 dark:bg-[#21262d] dark:text-blue-400 shadow-sm"
                      : "text-slate-400 dark:text-[#8b949e] hover:text-slate-700 dark:hover:text-[#c9d1d9]"
                  }`}
                >
                  {filter === "all" ? "ทั้งหมด" : filter === "gaps" ? "ต้องเรียนเพิ่ม" : "พร้อมแล้ว"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skill list */}
        {filteredReqs.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-3xl">🔍</span>
            <p className="text-sm text-slate-400 dark:text-[#8b949e] mt-2 font-medium">ไม่พบทักษะที่ค้นหาสำหรับตัวกรองนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReqs.map((req) => (
              <SkillGapCard
                key={req.name}
                name={req.name}
                myLevel={req.myLevel}
                req={req.req}
                gap={req.gap}
                isReady={req.isReady}
                details={skillDetails[req.name]}
                resourceLink={skillResources[req.name]}
                isExpanded={expandedSkill === req.name}
                onToggle={() => toggleExpandSkill(req.name)}
                onOpenRoadmap={() => setActiveRoadmapSkill(req.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══ 4. AI Learning Coach ═══ */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 dark:border-blue-500/20 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/15 dark:via-[#161b22] dark:to-indigo-950/10 p-6 md:p-8">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center relative text-blue-600 dark:text-blue-400">
            <span className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-25" />
            <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              ข้อเสนอแนะจาก โค้ชเรียนรู้อัจฉริยะ (AI Learning Coach)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {gapCount === 0 ? (
                <>
                  สุดยอดมาก! ประวัติทักษะของคุณไม่มีช่องว่างวิชาการที่ขาดแคลนสำหรับบทบาท <strong className="text-indigo-600 dark:text-indigo-400">{targetRole}</strong> คุณพร้อมที่จะมองหาโครงการหรือความท้าทายระดับยากเพื่อสะสมเกียรติบัตรและพิชิตเรซูเมระดับพรีเมียมแล้ว
                </>
              ) : (
                <>
                  จากการวิเคราะห์แผนผังทักษะของคุณ ตำแหน่ง <strong className="text-slate-800 dark:text-white">{targetRole}</strong> แนะนำให้คุณมุ่งเน้นไปที่การยกระดับความรู้ในวิชา <strong className="text-rose-500 dark:text-rose-400 font-extrabold">{sortedReqs[0]?.name}</strong> เป็นลำดับแรกสุด เนื่องจากมีปริมาณช่องว่างขนาดใหญ่สุดถึง <span className="text-red-500 font-bold">-{sortedReqs[0]?.gap}%</span> จากนั้นคอยพัฒนาวิชา <strong className="text-blue-500 dark:text-blue-400">{sortedReqs[1]?.name}</strong> ในสเต็ปถัดไป
                  <br />
                  <span className="block mt-2 text-[11px] font-bold text-indigo-500 dark:text-indigo-400">
                    ⏱️ คาดว่าต้องเรียนรู้อย่างสม่ำเสมอประมาณ {estimatedWeeks} สัปดาห์ (กรณีสัปดาห์ละ 5-8 ชม.) เพื่อปิดช่องว่างหลักทั้งหมดนี้
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* AI Learning Roadmap Overlay */}
      {activeRoadmapSkill && (
        <AILearningRoadmap
          skillName={activeRoadmapSkill}
          myLevel={mySkills[activeRoadmapSkill] || 0}
          targetLevel={currentRole.requirements.find(r => r.name === activeRoadmapSkill)?.req || 100}
          onClose={() => setActiveRoadmapSkill(null)}
        />
      )}

    </div>
  )
}
