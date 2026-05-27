'use client'

import { memo } from 'react'

interface StatItemProps {
  label: string
  value: number | string
  colorVar?: string
}

const StatItem = memo(({ label, value, colorVar = 'var(--accent)' }: StatItemProps) => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-4">
    <div 
      className="font-serif text-3xl font-semibold leading-none mb-1.5"
      style={{ color: colorVar }}
    >
      {value}
    </div>
    <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</div>
  </div>
))

StatItem.displayName = 'StatItem'

interface StatsCardProps {
  stats: Array<{
    label: string
    value: number | string
    colorVar?: string
  }>
}

const StatsCard = memo(({ stats }: StatsCardProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  )
})

StatsCard.displayName = 'StatsCard'

export { StatsCard, StatItem }
