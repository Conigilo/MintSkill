'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useUserSkills, useUserBadges } from '@/lib/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { githubService } from '@/lib/services/github.service'
import { Star, Github, ExternalLink, RefreshCw, Award, Code, FolderGit2 } from 'lucide-react'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'

export default function OverviewTab() {
  const { user, loading } = useAuth()
  const uid = user?.uid
  const { skills, isLoading: skillsLoading } = useUserSkills(uid)
  const { badges } = useUserBadges(uid)
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; badge: any | null }>({ isOpen: false, badge: null })
  const [profile, setProfile] = useState<{
    uid?: string,
    email?: string | null,
    photoURL?: string | null,
    displayName?: string | null,
    contributions?: number,
    projects?: any[],
    github?: {
      repoCount?: number,
      totalContributions?: number
    },
    recentRepos?: any[],
    stats?: {
      skillCount?: number,
      verifiedSkills?: number,
      endorsementCount?: number,
      contributions?: number,
      projectCount?: number
    }
  } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // ⚡ Cache stats calculations to avoid re-creating object reference on each render
  const stats = useMemo(() => ({
    verifiedSkills: profile?.stats?.verifiedSkills || 0,
    endorsements: profile?.stats?.endorsementCount || 0,
    contributions: profile?.stats?.contributions || 0,
    projects: profile?.stats?.projectCount || 0,
  }), [profile])

  // ⚡ Cache loadProfile function to maintain functional reference
  const loadProfile = useCallback(async () => {
    if (!uid) return
    try {
      const data = await githubService.getDashboard()
      setProfile(data?.data || data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [uid])

  useEffect(() => {
    if (!loading && uid) {
      loadProfile()
    }
  }, [uid, loading, loadProfile])

  // ⚡ Cache event handler callback functions
  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await githubService.syncGitHub()
      await loadProfile()
    } catch (err: any) {
      alert(err.message || 'GitHub sync failed. Please reconnect your account.')
    } finally {
      setIsSyncing(false)
    }
  }, [loadProfile])

  const toggleSpotlight = useCallback(async (repoId: string) => {
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
  }, [])

  // ⚡ Cache array operations to avoid array re-allocation on every render
  const topSkills = useMemo(() => skills?.slice(0, 5) || [], [skills])
  const recentRepos = useMemo(() => profile?.recentRepos || [], [profile])

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">

      {/* 1. Stats Grid (Single Row - 4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Verified Skills", value: stats.verifiedSkills.toString(), icon: <Code size={18} /> },
          { label: "Endorsements", value: stats.endorsements.toString(), icon: <Award size={18} /> },
          { label: "Contributions", value: stats.contributions.toString(), icon: <Star size={18} /> },
          { label: "GitHub Projects", value: stats.projects.toString(), icon: <FolderGit2 size={18} /> },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] p-5 rounded-2xl flex items-center justify-between transition-colors"
          >
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{skillsLoading || loading ? '...' : stat.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-[#30363d] flex items-center justify-center text-slate-500 dark:text-slate-400">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Content Row - Balanced 50/50 Columns (Equal Height) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Left Column: Top Skills & Badges */}
        <div className="flex flex-col gap-6 h-full">

          {/* Top Skills Card */}
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Skills</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">ทักษะที่ได้รับการยืนยันความสามารถสูงสุด</p>
              </div>
              <span className="text-[10px] font-bold border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {topSkills.length} Verified
              </span>
            </div>

            <div className="space-y-4">
              {skillsLoading ? (
                <p className="text-xs text-slate-400">Loading skills...</p>
              ) : topSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {topSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#f0f6fc]"
                    >
                      <img
                        src={getSkillLogoUrl(skill.name)}
                        className="w-4 h-4 object-contain"
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {skill.name}
                      {skill.level && (
                        <span className="text-[9px] bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold ml-1">
                          Lvl {skill.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">ยังไม่มีการเพิ่มทักษะ เริ่มทำควิซเพื่อปลดล็อกทักษะแรกของคุณได้ทันที!</p>
              )}
            </div>
          </div>

          {/* Earned Badges Card */}
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] p-6 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Earned Badges</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">เหรียญรางวัลรับรองระดับความสามารถ</p>
                </div>
                <span className="text-[10px] font-bold border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {badges?.length || 0} Total
                </span>
              </div>

              {skillsLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Loading...</p>
                </div>
              ) : badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {badges.map((badge, idx) => {
                    const bName = (badge.skillName || "").toLowerCase().trim();
                    const s = skills?.find(sk => (sk.name || "").toLowerCase().trim() === bName);
                    let lvl = Number(badge.level || s?.level || 1);

                    if (s) {
                      const q = s.quizScore || 0;
                      const e = s.endorsementScore || 0;
                      if (e >= 5 && q >= 10) lvl = 3;
                      else if (e >= 3 && q >= 7) lvl = 2;
                      else if (e >= 1 && q >= 4) lvl = 1;
                    }

                    const lvlLabels: Record<number, { name: string, color: string }> = {
                      3: { name: "Senior", color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20" },
                      2: { name: "Middle", color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20" },
                      1: { name: "Junior", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20" }
                    };

                    const label = lvlLabels[lvl] || { name: "Verified", color: "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border border-slate-200/50 dark:border-slate-500/20" };

                    return (
                      <div
                        key={idx}
                        onClick={() => setBadgeModal({ isOpen: true, badge })}
                        className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl hover:border-slate-350 dark:hover:border-[#484f58] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getSkillLogoUrl(badge.skillName || badge.name || '')}
                            className="w-7 h-7 object-contain shrink-0"
                            alt=""
                            onError={(e) => {
                              e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/8146/8146003.png';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{badge.name}</h4>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Verified via AI Quiz & Endorsements</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${label.color}`}>
                          {label.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 dark:text-slate-500">สะสมการรับรองเพื่อเริ่มปลดล็อกเหรียญรางวัลของคุณ</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: GitHub Spotlight */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] p-6 rounded-2xl flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">GitHub Spotlight</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">โปรเจกต์เด่นที่ได้รับการ Sync มาจาก GitHub</p>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-[#c9d1d9] border border-slate-200 dark:border-[#30363d] text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing..." : "Sync Profile"}
              </button>
            </div>

            {recentRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRepos.slice(0, 4).map((repo: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4.5 rounded-xl border transition-all flex flex-col justify-between h-[130px] ${repo.isSpotlight
                      ? 'border-slate-800 dark:border-white bg-slate-50 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-[#30363d] bg-transparent hover:border-slate-355 dark:hover:border-[#484f58]'
                      }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Github size={14} className="text-slate-400 shrink-0" />
                          <h4 className="font-bold text-slate-800 dark:text-[#f0f6fc] text-xs truncate">{repo.name}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleSpotlight(repo.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${repo.isSpotlight
                              ? 'text-slate-800 dark:text-white'
                              : 'text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400'
                              }`}
                            title={repo.isSpotlight ? "Remove Spotlight" : "Add Spotlight"}
                          >
                            <Star size={12} fill={repo.isSpotlight ? "currentColor" : "none"} />
                          </button>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {repo.description || "ไม่มีรายละเอียดของโปรเจกต์นี้"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-0.5">
                          ★ {repo.stars}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-[#30363d] my-auto">
                <Github size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-xs text-slate-400 dark:text-slate-500">เชื่อมต่อ GitHub เพื่อไฮไลท์ผลงานของคุณ</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {badgeModal.isOpen && badgeModal.badge && (() => {
        const activeBadge = badgeModal.badge;
        const bName = (activeBadge.skillName || "").toLowerCase().trim();
        const s = skills?.find(sk => (sk.name || "").toLowerCase().trim() === bName);
        let bLvl = Number(activeBadge.level || s?.level || 1);
        if (s) {
          const q = s.quizScore || 0;
          const e = s.endorsementScore || 0;
          if (e >= 5 && q >= 10) bLvl = 3;
          else if (e >= 3 && q >= 7) bLvl = 2;
          else if (e >= 1 && q >= 4) bLvl = 1;
        }

        const lvlNames: Record<number, string> = { 3: "Senior", 2: "Middle", 1: "Junior" };
        const lvlColors: Record<number, string> = { 
          3: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-250/30", 
          2: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-250/30", 
          1: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-250/30" 
        };
        const modalBorders: Record<number, string> = {
          3: "border-amber-500/30 dark:border-amber-500/20",
          2: "border-blue-500/30 dark:border-blue-500/20",
          1: "border-emerald-500/30 dark:border-emerald-500/20"
        };

        const credId = `skw-${String(activeBadge.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`;
        
        // 🗓️ Safely parse and format dates
        let dateStr = "ไม่ระบุวันที่";
        const unlockedAt = activeBadge.unlockedAt;
        if (unlockedAt) {
          let dateObj: Date | null = null;
          if (unlockedAt.seconds) {
            dateObj = new Date(unlockedAt.seconds * 1000);
          } else if (unlockedAt.toDate && typeof unlockedAt.toDate === "function") {
            dateObj = unlockedAt.toDate();
          } else {
            dateObj = new Date(unlockedAt);
          }
          if (dateObj && !isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        }

        const borderStyle = modalBorders[bLvl] || "border-slate-200 dark:border-[#30363d]";
        const labelStyle = lvlColors[bLvl] || "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10";

        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setBadgeModal({ isOpen: false, badge: null })}
          >
            <div
              className={`bg-white dark:bg-[#0d1117] border-2 ${borderStyle} rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden p-1`}
              onClick={e => e.stopPropagation()}
            >
              {/* Inner frame representing a certificate */}
              <div className="border border-slate-100 dark:border-[#21262d] rounded-xl p-6 relative">
                
                {/* Header info */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Skill Certificate
                  </span>
                  <button
                    onClick={() => setBadgeModal({ isOpen: false, badge: null })}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Main logo and Title */}
                <div className="flex flex-col items-center text-center mt-4">
                  <div className={`w-20 h-20 rounded-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-[#30363d] flex items-center justify-center shadow-sm relative mb-4 p-4`}>
                    <img
                      src={getSkillLogoUrl(activeBadge.skillName || activeBadge.name || '')}
                      alt={activeBadge.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback-modal-large");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    <div className="logo-fallback-modal-large hidden font-bold text-2xl text-slate-400 dark:text-[#8b949e] select-none">
                      {(activeBadge.skillName || activeBadge.name || 'SK').slice(0, 2).toUpperCase()}
                    </div>
                    {/* Official check stamp (Green) */}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0d1117] shadow">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                    {activeBadge.name}
                  </h3>
                  
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider mt-3 ${labelStyle}`}>
                    {lvlNames[bLvl] || "Verified"} Level
                  </span>
                </div>

                {/* Certificate Details */}
                <div className="mt-8 space-y-4">
                  <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-xl p-4.5 border border-slate-100 dark:border-[#21262d] space-y-3 text-left">
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Verification Details</p>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                        {activeBadge.description || `Successfully verified by Endorsements and AI Quiz at ${lvlNames[bLvl] || 'Expert'} Level.`}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">Issued: {dateStr}</p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 dark:border-[#21262d] flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-[#161b22] border border-slate-200/50 dark:border-white/5 px-2 py-0.5 rounded">
                          {credId}
                        </p>
                      </div>
                      
                      {/* Certified Stamp Text (Green & Larger) */}
                      <div className="text-xs md:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase border-2 border-emerald-500/25 dark:border-emerald-500/10 rounded-md px-2 py-0.5 rotate-[-12deg] tracking-widest select-none">
                        Certified
                      </div>
                    </div>
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