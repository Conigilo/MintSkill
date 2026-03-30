'use client'

import { memo } from 'react'
import { Avatar } from '@/components/ui'
import type { AuthUser } from '@/lib/types'

interface ProfileCardProps {
  user: AuthUser
  onRequestEndorsement?: () => void
  onExport?: () => void
}

const ProfileCard = memo(
  ({ user, onRequestEndorsement, onExport }: ProfileCardProps) => {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center">
        <div className="relative inline-block mb-3">
          <Avatar
            src={user?.photoURL || undefined}
            alt={user?.displayName || 'User'}
            initials={user?.displayName?.substring(0, 2).toUpperCase()}
            size="lg"
          />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[var(--green)] rounded-full border-2 border-[var(--surface)]" />
        </div>
        
        <div className="font-serif text-[20px] font-semibold tracking-tight leading-tight">
          {user.displayName || 'User'}
        </div>
        <div className="font-mono text-[12px] text-[var(--muted)] mb-1">
          @{user.email?.split('@')[0] || 'user'}
        </div>
        <div className="text-[13px] text-[var(--accent)] mb-3">
          Full-Stack Developer
        </div>
        
        <div className="text-[12px] text-[var(--muted)] text-left mb-3.5 leading-relaxed">
          Passionate developer building amazing products and always eager to learn new technologies.
        </div>
        
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 8a6.5 6.5 0 1 1 13 0A6.5 6.5 0 0 1 1.5 8zM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75z"/></svg>
            San Francisco, CA
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            5+ years experience
          </div>
        </div>
        
        <button
          onClick={onRequestEndorsement}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium bg-[var(--accent)] text-[#0d1117] border border-[var(--accent)] hover:bg-[#79c0ff] transition-colors"
        >
          ✉ Request Endorsement
        </button>
        <button
          onClick={onExport}
          className="w-full mt-1.5 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface2)] transition-colors inline-block"
        >
          ⬇ Export Portfolio
        </button>
      </div>
    )
  },
)

ProfileCard.displayName = 'ProfileCard'

export default ProfileCard
