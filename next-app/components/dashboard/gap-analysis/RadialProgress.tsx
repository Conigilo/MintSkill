'use client'

import { useState, useEffect } from 'react'

interface RadialProgressProps {
  value: number
  size?: number
  strokeWidth?: number
}

/**
 * SVG Radial Progress Ring — แสดงเปอร์เซ็นต์ Overall Fit แบบวงกลม
 * ย้ายจาก GapAnalysisTab.tsx
 */
export default function RadialProgress({ value, size = 140, strokeWidth = 10 }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference)
    }, 200)
    return () => clearTimeout(timer)
  }, [value, circumference])

  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : value >= 30 ? '#f97316' : '#ef4444'
  const gradientId = `radial-grad-${value}`

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={value >= 80 ? '#4ade80' : value >= 60 ? '#ffe066' : value >= 30 ? '#fb923c' : '#f87171'} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Track Ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          className="stroke-slate-100 dark:stroke-[#21262d]"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Value text in the center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{value}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Match</span>
      </div>
    </div>
  )
}
