'use client'
import { getUserProfile } from '@/lib/services/user.service';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

type TabType = 'overview' | 'skills' | 'endorsements' | 'profile' | 'projects'

/**
 * Dashboard page for authenticated users
 * Shows user profile, skills, endorsements, and GitHub stats
 */
export default function DashboardPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [isFetching, setIsFetching] = useState(true)
    const { isAuthenticated, isLoading, user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>('overview')

    // Redirect to login if not authenticated
    useEffect(() => {
        async function loadProfile() {
            if (user) {
                try {
                    setIsFetching(true)
                    const token = await user.getIdToken() // ดึง Token จาก Firebase
                    const data = await getUserProfile(token) // เรียก Service ที่เราสร้าง
                    setProfile(data) // เก็บข้อมูลลง State
                } catch (error) {
                    console.error("Failed to load profile:", error)
                } finally {
                    setIsFetching(false)
                }
            }
        }
        loadProfile()
    }, [user])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login')
        }
    }, [isLoading, isAuthenticated, router])

    // Show loading state
    if (isLoading || isFetching) {
        return <LoadingScreen />
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
            <DashboardNavBar onLogout={logout} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                <DashboardSidebar user={user} profile={profile} />

                <main className="space-y-5">
                    <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Tab Content */}
                    {activeTab === 'overview' && <OverviewTab profile={profile} />}
                    {activeTab === 'skills' && <SkillsTab profile={profile} />}
                    {activeTab === 'endorsements' && <EndorsementsTab profile={profile} />}
                    {activeTab === 'profile' && <ProfileTab profile={profile} />}
                    {activeTab === 'projects' && <ProjectsTab profile={profile} />}
                </main>
            </div>
        </div>
    )
}

/**
 * Loading spinner screen
 */
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        </div>
    )
}

/**
 * Top navigation bar with logo and logout button
 */
function DashboardNavBar({
    onLogout,
    activeTab,
    onTabChange,
}: {
    onLogout: () => void
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}) {
    return (
        <nav className="border-b border-[#30363d] bg-[#0d1117] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div className="font-mono text-lg font-bold">
                    skill<span className="text-[#58a6ff]">wallet</span>
                </div>
                <div className="hidden md:flex gap-1">
                    {(['overview', 'skills', 'endorsements', 'profile', 'projects'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`px-3 py-1.5 text-sm rounded transition-colors capitalize ${activeTab === tab
                                ? 'bg-[#1c2128] text-[#e6edf3]'
                                : 'text-[#8b949e] hover:text-[#e6edf3]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={onLogout}
                className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
                Sign out
            </button>
        </nav>
    )
}

/**
 * Sidebar with user profile card and GitHub stats
 */
function DashboardSidebar({ user, profile }: { user: any, profile: any }) {
    return (
        <aside className="space-y-4">
            <UserProfileCard user={user} profile={profile} />
            <GitHubStatsCard />
        </aside>
    )
}

/**
 * User profile card with avatar and info
 */
function UserProfileCard({ user, profile }: { user: any, profile: any }) {
    const displayName = profile?.displayName || user.displayName || 'Developer'
    const email = profile?.email || user.email
    const title = profile?.title || 'Full-Stack Developer'
    const bio = profile?.bio || 'Passionate about building products. Love algorithms, system design, and tech investing.'
    const firstLetter = (profile?.displayName || user.displayName)?.[0] || user.email?.[0]?.toUpperCase() || 'D'

    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5 text-center space-y-3">
            {/* Avatar */}
            <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1f6feb] to-[#58a6ff] flex items-center justify-center text-3xl font-serif font-bold text-white border-4 border-[#30363d]">
                    {firstLetter}
                </div>
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#3fb950] rounded-full border-2 border-[#161b22]" />
            </div>

            {/* User Info */}
            <div>
                <h2 className="text-xl font-serif font-semibold leading-tight">{displayName}</h2>
                <p className="font-mono text-xs text-[#8b949e] mb-2">{email}</p>
                <p className="text-[#58a6ff] text-sm mb-3">{title}</p>
            </div>

            {/* Bio */}
            <p className="text-xs text-[#8b949e] leading-relaxed">
                {bio}
            </p>

            {/* Action Button */}
            <button className="w-full bg-[#238636] hover:bg-[#26843b] text-white text-sm py-2 rounded transition-colors">
                ✉ Request Endorsement
            </button>
        </div>
    )
}

/**
 * GitHub connected stats card
 */
function GitHubStatsCard() {
    const stats = [
        { label: 'Repositories', value: '42' },
        { label: 'Contributions', value: '847' },
        { label: 'Stars earned', value: '234' },
    ]

    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-[#8b949e] uppercase tracking-wider">
                    GitHub
                </span>
                <span className="text-[10px] text-[#3fb950] bg-[#3fb9501a] border border-[#3fb9504d] px-2 py-0.5 rounded-full">
                    ● Connected
                </span>
            </div>
            <div className="space-y-1.5 border-t border-[#30363d] pt-3">
                {stats.map(stat => (
                    <div key={stat.label} className="flex justify-between text-xs">
                        <span className="text-[#8b949e]">{stat.label}</span>
                        <span className="font-mono text-[#e6edf3]">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Tab navigation component
 */
function TabNavigation({
    activeTab,
    onTabChange,
}: {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}) {
    const tabs: TabType[] = ['overview', 'skills', 'endorsements', 'profile', 'projects']

    return (
        <div className="flex border-b border-[#30363d]">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-5 py-2.5 text-sm border-b-2 transition-all capitalize ${activeTab === tab
                        ? 'border-[#58a6ff] text-[#e6edf3]'
                        : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    )
}

/**
 * Overview tab content
 */
function OverviewTab({ profile }: { profile: any }) {
    return (
        <div className="space-y-5">
            <StatisticsGrid profile={profile} />
            <TopSkillsSection profile={profile} />
        </div>
    )
}

/**
 * Statistics grid showing user metrics
 */
function StatisticsGrid({ profile }: { profile: any }) {
    const stats = [
        { number: profile?.skillsCount || '0', label: 'Verified Skills', color: '#58a6ff' },
        { number: profile?.endorsementsCount || '0', label: 'Endorsements', color: '#3fb950' },
        { number: profile?.contributionsCount || '0', label: 'Contributions', color: '#d29922' },
        { number: profile?.projectsCount || '0', label: 'Projects', color: '#bc8cff' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(stat => (
                <div
                    key={stat.label}
                    className="rounded-lg bg-[#161b22] border border-[#30363d] p-4 space-y-2"
                >
                    <div
                        className="text-3xl font-serif font-bold"
                        style={{ color: stat.color }}
                    >
                        {stat.number}
                    </div>
                    <div className="text-[10px] text-[#8b949e] uppercase tracking-wider">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Top skills section
 */
function TopSkillsSection({ profile }: { profile: any }) {
    const skills = profile?.topSkills || ['JavaScript', 'Python', 'Java', 'HTML/CSS']

    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="font-serif text-base font-semibold">Top Skills</h3>
                <span className="text-[10px] text-[#3fb950] bg-[#3fb9501a] border border-[#3fb9504d] px-2 py-0.5 rounded-full">
                    Auto-synced
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="font-mono text-[10px] text-[#8b949e] uppercase mb-3">
                        Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string) => (
                            <div
                                key={skill}
                                className="bg-[#1c2128] border border-[#30363d] px-3 py-1.5 rounded-md text-xs hover:border-[#58a6ff] cursor-default transition-colors"
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Skills tab content
 */
function SkillsTab({ profile }: { profile: any }) {
    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <h3 className="font-serif text-lg font-semibold mb-4">All Skills</h3>
            {profile?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: any) => (
                        <div key={skill.name} className="bg-[#1c2128] border border-[#30363d] px-4 py-2 rounded-md text-sm">
                            {skill.name} - Level {skill.level}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[#8b949e]">No skills found. Start adding some!</p>
            )}
        </div>
    )
}

/**
 * Endorsements tab content
 */
function EndorsementsTab({ profile }: { profile: any }) {
    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <h3 className="font-serif text-lg font-semibold mb-4">Endorsements</h3>
            <p className="text-sm text-[#8b949e]">You have {profile?.endorsementsCount || 0} endorsements.</p>
        </div>
    )
}

/**
 * Profile tab content
 */
function ProfileTab({ profile }: { profile: any }) {
    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <h3 className="font-serif text-lg font-semibold mb-4">User Profile</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-[#8b949e] uppercase mb-1">Display Name</label>
                    <p className="text-sm">{profile?.displayName || 'Not set'}</p>
                </div>
                <div>
                    <label className="block text-xs text-[#8b949e] uppercase mb-1">Email</label>
                    <p className="text-sm">{profile?.email}</p>
                </div>
                <div>
                    <label className="block text-xs text-[#8b949e] uppercase mb-1">Bio</label>
                    <p className="text-sm">{profile?.bio || 'No bio available'}</p>
                </div>
            </div>
        </div>
    )
}

function ProjectsTab({ profile }: { profile: any }) {
    return (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-5">
            <h3 className="font-serif text-lg font-semibold mb-4">Projects</h3>
            {profile?.projects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects.map((project: any) => (
                        <div key={project.name} className="bg-[#1c2128] border border-[#30363d] p-4 rounded-md">
                            <h4 className="font-semibold text-sm">{project.name}</h4>
                            <p className="text-xs text-[#8b949e] mt-1">{project.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[#8b949e]">No projects found.</p>
            )}
        </div>
    )
}