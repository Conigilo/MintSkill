import Link from 'next/link'

type TabType = 'overview' | 'skills' | 'endorsements' | 'gap' | 'widget'

interface NavbarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="bg-[var(--bg)]/80 border-b border-[var(--border)] px-6 py-3 flex items-center gap-6 sticky top-0 z-50 backdrop-blur-md">
      {/* Logo */}
      <div className="font-mono text-xl tracking-tight font-bold">
        <span className="text-slate-900">skill</span>
        <span className="text-[var(--accent)]">wallet</span>
      </div>

      {/* Nav links (desktop) */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onTabChange('overview') }}
        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
      >
        Profile
      </a>
      <a href="#" className="nav-link">Explore</a>
      <a href="#" className="nav-link">Jobs</a>

      {/* Auth buttons */}
      <div className="flex gap-3 ml-auto">
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
        >
          Sign in
        </Link>
        <Link 
          href="/signup" 
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all"
        >
          Get started
        </Link>
      </div>
    </nav>
  )
}
