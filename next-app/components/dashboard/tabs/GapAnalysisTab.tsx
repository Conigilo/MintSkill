'use client'

import { useState } from 'react'

interface GapAnalysisTabProps {
  skills: Array<{ name: string; level?: number; [key: string]: any }>
}

const rolesData: Record<string, { desc: string; requirements: { name: string; req: number }[] }> = {
  "Full-Stack Engineer": {
    desc: "Web Application development (frontend + backend)",
    requirements: [
      { name: "JavaScript", req: 90 },
      { name: "React", req: 85 },
      { name: "Node.js", req: 80 },
      { name: "System Design", req: 70 },
      { name: "SQL", req: 65 },
    ],
  },
  "Data Scientist / AI": {
    desc: "Data analysis and Machine Learning model development",
    requirements: [
      { name: "Python", req: 90 },
      { name: "SQL", req: 85 },
      { name: "Finance/Math", req: 80 },
      { name: "React", req: 40 },
    ],
  },
  "QA Automation": {
    desc: "Test automation and software quality assurance",
    requirements: [
      { name: "Testing", req: 90 },
      { name: "Python", req: 75 },
      { name: "JavaScript", req: 70 },
      { name: "Node.js", req: 50 },
    ],
  },
  "Quant Developer": {
    desc: "Algorithmic trading and quantitative finance development",
    requirements: [
      { name: "C++", req: 90 },
      { name: "Python", req: 85 },
      { name: "Finance/Math", req: 85 },
      { name: "System Design", req: 60 },
    ],
  },
}

export default function GapAnalysisTab({ skills }: GapAnalysisTabProps) {
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer")

  const mySkills: Record<string, number> = (skills || []).reduce(
    (acc: Record<string, number>, s) => { acc[s.name] = (s.level || 0) * 20; return acc },
    {} as Record<string, number>
  )

  const currentRole = rolesData[targetRole]

  let totalScore = 0
  let maxScore = 0
  currentRole.requirements.forEach(req => {
    const myLevel = mySkills[req.name] || 0
    totalScore += Math.min(myLevel, req.req)
    maxScore += req.req
  })
  const matchPercentage = Math.round((totalScore / maxScore) * 100)

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800/50 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Skill Gap Analysis</h3>
          <p className="text-sm text-gray-400 mt-1">Compare your skills against target role requirements</p>
        </div>
        <div className="flex items-center gap-3 bg-[#090d14] border border-gray-700 p-1.5 rounded-xl">
          <span className="text-xs text-gray-400 font-bold pl-3 uppercase tracking-wider">Target Role:</span>
          <select
            className="bg-[#090d14] text-white text-sm font-bold focus:outline-none pr-4 py-1.5 cursor-pointer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            {Object.keys(rolesData).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold mb-1">{targetRole}</h4>
            <p className="text-sm text-gray-400">{currentRole.desc}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Overall Match</div>
            <div className={`text-3xl font-black ${matchPercentage >= 80 ? 'text-green-400' : matchPercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {matchPercentage}%
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {currentRole.requirements.map((req, idx) => {
            const myLevel = mySkills[req.name] || 0
            const gap = req.req - myLevel
            let statusText = ""
            let barColor = ""
            if (gap <= 0) {
              statusText = "Ready"; barColor = "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            } else if (gap <= 15) {
              statusText = "Minor Gap"; barColor = "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
            } else {
              statusText = "Major Gap"; barColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            }
            return (
              <div key={idx} className="bg-[#161b22] p-4 rounded-xl border border-gray-800/50">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-white font-bold text-sm">{req.name}</span>
                    <span className="text-gray-500 text-xs ml-2">Req: {req.req}%</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${gap <= 0 ? "text-green-400 border-green-500/30 bg-green-500/10" : gap <= 15 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                    {statusText} {gap > 0 && `(-${gap}%)`}
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-[#090d14] rounded-full overflow-hidden border border-gray-800">
                  <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-gray-400/50 z-10" style={{ left: `${req.req}%` }}></div>
                  <div className={`absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${myLevel}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
          <span className="text-xl">??</span>
          <p className="text-sm text-blue-200 leading-relaxed">
            <strong className="text-blue-400">AI Suggestion:</strong> Focus on projects related to{' '}
            <strong className="text-white">
              {[...currentRole.requirements].sort((a, b) => (b.req - (mySkills[b.name] || 0)) - (a.req - (mySkills[a.name] || 0)))[0].name}
            </strong>{' '}
            to close your biggest skill gap for {targetRole}.
          </p>
        </div>
      </div>
    </div>
  )
}
