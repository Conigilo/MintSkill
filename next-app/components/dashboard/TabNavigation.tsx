'use client'

export type TabType = 'overview' | 'skills' | 'endorsements' | 'gap' | 'widget'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { key: TabType; label: string; count?: number }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'skills', label: 'Skills', count: 24 },
  { key: 'endorsements', label: 'Endorsements', count: 12 },
  { key: 'gap', label: 'Gap Analysis' },
  { key: 'widget', label: 'Widget & Export' },
]

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`tab ${activeTab === tab.key ? 'active' : ''}`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
