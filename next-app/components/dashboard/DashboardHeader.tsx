'use client'

import { memo } from 'react'
import { Avatar } from '@/components/ui'
import type { TabKey, AuthUser } from '@/lib/types'
import { DASHBOARD_TABS } from '@/lib/constants'

interface DashboardHeaderProps {
  user: AuthUser
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onLogout: () => void
  isLoadingLogout?: boolean
}

const DashboardHeader = memo(
  ({
    user,
    activeTab,
    onTabChange,
    onLogout,
    isLoadingLogout = false,
  }: DashboardHeaderProps) => {
    return (
      <header className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0 z-50">
        {/* Top Bar matching nav in index.html */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Logo" className="h-40 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-[var(--text)]">{user?.displayName || 'User'}</div>
              <div className="text-[11px] text-[var(--muted)]">{user?.email || 'unknown'}</div>
            </div>
            <Avatar
              src={user?.photoURL || undefined}
              alt={user?.displayName || 'User'}
              size="sm"
            />
            <button
              onClick={onLogout}
              disabled={isLoadingLogout}
              className="ml-2 px-3 py-1.5 rounded-md text-[12px] font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)] transition-colors border border-[var(--border)]"
            >
              {isLoadingLogout ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Tab Navigation matching .tabs from index.html */}
        <div className="flex gap-0 border-t border-[var(--border)] px-6 overflow-x-auto">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key as TabKey)}
                className={`px-5 py-2.5 text-[13px] cursor-pointer border-b-2 transition-all flex items-center gap-1.5 mb-[-1px] whitespace-nowrap
                  ${isActive
                    ? 'text-[var(--text)] border-[var(--accent)]'
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--text)]'}
                `}
              >
                {tab.label}
                {'count' in tab && tab.count && (
                  <span className="bg-[var(--surface2)] border border-[var(--border)] px-[6px] py-[1px] rounded-full text-[11px] font-mono text-[var(--text)]">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>
    )
  },
)

DashboardHeader.displayName = 'DashboardHeader'

export default DashboardHeader
