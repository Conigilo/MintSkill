'use client'

import { useState, useEffect } from 'react'
import { useUserSkills, useUserBadges, useMyEndorsements } from '@/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { githubService } from '@/lib/services/github.service'
import { Star, Github, ExternalLink, RefreshCw } from 'lucide-react'

export default function OverviewTab() {
  const { user, loading } = useAuth()
  const uid = user?.uid
  const { skills, isLoading: skillsLoading } = useUserSkills(uid)
  const { badges } = useUserBadges(uid)
  const { endorsements } = useMyEndorsements()
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; badge: any | null }>({ isOpen: false, badge: null })
  const [profile, setProfile] = useState<{ uid?: string, email?: string | null, photoURL?: string | null, displayName?: string | null, contributions?: number, projects?: any[], github?: { repoCount?: number, totalContributions?: number }, recentRepos?: any[] } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const stats = {
    verifiedSkills: skills?.length || 0,
    endorsements: endorsements?.length || 0,
    contributions: profile?.github?.totalContributions || profile?.contributions || 0,
    projects: profile?.github?.repoCount || profile?.projects?.length || 0,
  }

  const loadProfile = async () => {
    if (!uid) return
    try {
      // Use getDashboard to get everything including recentRepos
      const data = await githubService.getDashboard()
      setProfile(data?.data || data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  useEffect(() => {
    if (!loading && uid) {
      loadProfile()
    }
  }, [uid, loading, user])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await githubService.syncGitHub()
      await loadProfile()
    } catch (err: any) {
      alert(err.message || 'GitHub sync failed. Please reconnect your account.')
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleSpotlight = async (repoId: string) => {
    try {
      await githubService.toggleSpotlight(repoId)
      // Optimistic update
      setProfile(prev => {
        if (!prev) return prev
        return {
          ...prev,
          recentRepos: prev.recentRepos?.map((r: any) => 
            r.id === repoId ? { ...r, isSpotlight: !r.isSpotlight } : r
          )
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const topSkills = skills?.slice(0, 5) || []
  const topBadges = badges?.slice(0, 4) || []
  const recentRepos = profile?.recentRepos || []

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "VERIFIED SKILLS", value: stats.verifiedSkills.toString(), color: "text-blue-400" },
          { label: "ENDORSEMENTS", value: stats.endorsements.toString(), color: "text-green-400" },
          { label: "CONTRIBUTIONS", value: stats.contributions.toString(), color: "text-yellow-400" },
          { label: "PROJECTS", value: stats.projects.toString(), color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl text-center hover:bg-gray-800/30 transition-colors">
            <p className={`text-3xl font-bold mb-1 ${stat.color}`}>{skillsLoading || loading ? '...' : stat.value}</p>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Top Skills Section */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Top Skills</h3>
            <span className="text-xs border border-gray-700 bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-400">
              {topSkills.length} verified
            </span>
          </div>

          <div className="space-y-6">
            {skillsLoading ? (
              <p className="text-gray-400">Loading skills...</p>
            ) : topSkills.length > 0 ? (
              <div>
                <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">{topSkills[0]?.category}</p>
                <div className="flex flex-wrap gap-3">
                  {topSkills.map((skill, idx) => (
                    <div key={idx} className="bg-[#161b22] border border-gray-700/50 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      {skill.name}
                      {skill.level && <span className="text-gray-500 text-xs ml-1">★{skill.level}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No skills added yet. Add your first skill!</p>
            )}
          </div>
        </div>

        {/* 3. Badges Section */}
        <div className="glass-panel p-8 rounded-3xl h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Earned Badges</h3>
            <span className="text-xs border border-gray-700 bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-400">
              {topBadges.length} total
            </span>
          </div>
          {topBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {topBadges.map((badge, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setBadgeModal({ isOpen: true, badge })}
                  className="bg-[#0d1117]/50 border border-gray-800 rounded-2xl p-4 text-center hover:border-blue-500/50 hover:bg-[#161b22] transition-all cursor-pointer shadow-sm shadow-blue-900/10"
                >
                  <img src={badge.iconUrl || 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png'} className="w-8 h-8 object-contain mx-auto mb-2" alt="" />
                  <h4 className="text-xs font-semibold text-white truncate">{badge.name}</h4>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="text-3xl mb-2 grayscale opacity-30">🏆</div>
                <p className="text-xs text-gray-500">Get endorsements to earn badges!</p>
             </div>
          )}
        </div>
      </div>

      {/* 4. GitHub Featured Repos Section */}
      <div className="glass-panel p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">GitHub Spotlight</h3>
            <button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            </button>
          </div>
          <span className="text-xs text-gray-500">
             Pin your best works to show on profile
          </span>
        </div>

        {recentRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentRepos.map((repo: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border transition-all relative group bg-[#0d1117]/50 ${
                  repo.isSpotlight ? 'border-orange-500/40 bg-orange-500/[0.03]' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Github size={16} className="text-gray-400" />
                    <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{repo.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleSpotlight(repo.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        repo.isSpotlight 
                          ? 'bg-orange-500/20 text-orange-400' 
                          : 'bg-gray-800 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title={repo.isSpotlight ? "Remove from Spotlight" : "Add to Spotlight"}
                    >
                      <Star size={14} fill={repo.isSpotlight ? "currentColor" : "none"} />
                    </button>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:text-white">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-4">
                  {repo.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && <span>★ {repo.stars}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-black/20 rounded-2xl border border-dashed border-gray-800">
             <Github size={32} className="mx-auto mb-3 text-gray-700" />
             <p className="text-sm text-gray-500">Connect GitHub to spotlight your projects</p>
          </div>
        )}
      </div>

      {/* ================= Badge Certificate Modal ================= */}
      {badgeModal.isOpen && badgeModal.badge && (() => {
        const activeBadge = badgeModal.badge;
        const credId = `skw-${String(activeBadge.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`;
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setBadgeModal({ isOpen: false, badge: null })}
          >
            <div
              className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skill Certificate</span>
                <button
                  onClick={() => setBadgeModal({ isOpen: false, badge: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <div className={`w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-lg relative mb-4`}>
                  <img src={activeBadge.iconUrl || 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png'} className="w-10 h-10 object-contain" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-[#0d1117] w-6 h-6 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{activeBadge.name}</h3>
                <p className="text-blue-400 text-sm font-medium mt-1">Verified Expert</p>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="bg-[#090d14] rounded-2xl p-4 border border-gray-800 space-y-3 text-left">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Verification Details</p>
                    <p className="text-sm text-green-400 font-medium">
                      {activeBadge.description || `Successfully verified by Endorsements and AI Quiz for ${activeBadge.skillName}`}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Issued: {new Date(activeBadge.unlockedAt?.seconds ? activeBadge.unlockedAt.seconds * 1000 : activeBadge.unlockedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                    <p className="text-xs text-gray-400 font-mono bg-[#161b22] px-2 py-1 rounded">{credId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  )
}