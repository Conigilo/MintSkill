'use client'

import { useEffect, useRef } from 'react'
import { mockProfile, mockGitHub } from '@/lib/mock-data'

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <ProfileCard />
      <GitHubCard />
    </aside>
  )
}

function ProfileCard() {
  const p = mockProfile
  return (
    <div className="glass-panel rounded-2xl p-6 text-center">
      {/* Avatar */}
      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1f6feb] to-[#58a6ff] flex items-center justify-center font-serif text-[32px] font-semibold text-white border-[3px] border-[var(--border)]">
          {p.initial}
        </div>
        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[var(--green)] rounded-full border-2 border-[var(--surface)]" />
      </div>

      {/* Info */}
      <div className="font-serif text-xl font-semibold tracking-tight">{p.name}</div>
      <div className="font-mono text-xs text-[var(--muted)] mb-1">{p.handle}</div>
      <div className="text-[13px] text-[var(--accent)] mb-3">{p.title}</div>
      <p className="text-xs text-[var(--muted)] text-left mb-3.5 leading-relaxed">{p.bio}</p>

      {/* Meta rows */}
      <div className="flex flex-col gap-1.5">
        <MetaRow icon="location" text={p.location} />
        <MetaRow icon="github" text={p.github} />
        <MetaRow icon="linkedin" text={p.linkedin} />
      </div>

      {/* Buttons */}
      <button className="btn btn-primary btn-full mt-3.5">✉ Request Endorsement</button>
      <button className="btn btn-ghost btn-full" style={{ marginTop: 6 }}>⬇ Export Portfolio</button>
    </div>
  )
}

function MetaRow({ icon, text }: { icon: string; text: string }) {
  const icons: Record<string, React.ReactNode> = {
    location: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 8a6.5 6.5 0 1 1 13 0A6.5 6.5 0 0 1 1.5 8zM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75z" />
      </svg>
    ),
    github: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
    linkedin: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
      </svg>
    ),
  }

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
      {icons[icon]}
      {text}
    </div>
  )
}

function GitHubCard() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || gridRef.current.children.length > 0) return
    const levels = [null, 'c1', 'c2', 'c3', 'c4']
    for (let i = 0; i < 52 * 2; i++) {
      const cell = document.createElement('div')
      cell.className = 'contrib-cell'
      const rand = Math.random()
      if (rand > 0.6) {
        const lvl = Math.floor(Math.random() * 4) + 1
        cell.classList.add(levels[lvl]!)
      }
      gridRef.current.appendChild(cell)
    }
  }, [])

  const stats = [
    { label: 'Repositories', value: mockGitHub.repositories },
    { label: 'Contributions', value: mockGitHub.contributions },
    { label: 'Stars earned', value: mockGitHub.stars },
    { label: 'Pull Requests', value: mockGitHub.pullRequests },
  ]

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-wider">GitHub</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--green)] bg-[rgba(63,185,80,0.1)] border border-[rgba(63,185,80,0.3)] px-2 py-0.5 rounded-full">
          ● Connected
        </span>
      </div>
      {stats.map((s) => (
        <div key={s.label} className="flex justify-between text-xs py-1 border-b border-[var(--border)] last:border-b-0">
          <span className="text-[var(--muted)]">{s.label}</span>
          <span className="font-mono text-[var(--text)]">{s.value}</span>
        </div>
      ))}
      <div ref={gridRef} className="contrib-grid mt-2.5" />
    </div>
  )
}
