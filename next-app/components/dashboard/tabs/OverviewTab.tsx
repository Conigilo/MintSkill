'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useUserSkills, useUserBadges } from '@/lib/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { githubService } from '@/lib/services/github.service'
import {
  Star, Github, ExternalLink, RefreshCw, Award, Code, FolderGit2,
  MapPin, Linkedin, Sparkles, Activity, TrendingUp, ArrowUpRight
} from 'lucide-react'
import { getSkillLogoUrl } from '@/lib/utils/skill-logo'

// Heat Map

const HEAT = [
  'bg-slate-100 dark:bg-[#161b22]',
  'bg-emerald-200 dark:bg-emerald-900/60',
  'bg-emerald-400 dark:bg-emerald-700/80',
  'bg-emerald-500 dark:bg-emerald-500',
  'bg-emerald-600 dark:bg-emerald-400',
]

function Heatmap({ grid }: { grid: number[] }) {
  const ROWS = 5, COLS = 26
  const cells = useMemo(() => {
    const r: number[][] = []
    for (let i = 0; i < ROWS; i++) {
      const row: number[] = []
      for (let j = 0; j < COLS; j++) row.push(grid[i * COLS + j] ?? 0)
      r.push(row)
    }
    return r
  }, [grid])

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col gap-[3px] min-w-fit">
        {cells.map((row, ri) => (
          <div key={ri} className="flex gap-[3px]">
            {row.map((lv, ci) => (
              <div
                key={ci}
                className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-150 hover:ring-1 hover:ring-emerald-400/50 ${HEAT[Math.min(lv, 4)]}`}
                title={`${lv} contribution${lv !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-[var(--muted)] mr-0.5">Less</span>
        {HEAT.map((c, i) => <div key={i} className={`w-[9px] h-[9px] rounded-[2px] ${c}`} />)}
        <span className="text-[9px] text-[var(--muted)] ml-0.5">More</span>
      </div>
    </div>
  )
}


// ──────────────────────────────────────────────
export default function OverviewTab() {
  const { user, loading } = useAuth()
  const uid = user?.uid
  const { skills, isLoading: skillsLoading } = useUserSkills(uid)
  const { badges } = useUserBadges(uid)
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; badge: any | null }>({ isOpen: false, badge: null })
  const [profile, setProfile] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const dashProfile = useMemo(() => profile?.profile || {}, [profile])
  const dashGithub = useMemo(() => profile?.github || {}, [profile])
  const contributionGrid = useMemo(() => dashGithub?.contributionGrid || [], [dashGithub])

  const stats = useMemo(() => ({
    verifiedSkills: profile?.stats?.verifiedSkills || 0,
    endorsements: profile?.stats?.endorsementCount || 0,
    contributions: profile?.stats?.contributions || 0,
    projects: profile?.stats?.projectCount || 0,
  }), [profile])

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
    if (!loading && uid) loadProfile()
  }, [uid, loading, loadProfile])

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await githubService.syncGitHub()
      await loadProfile()
    } catch (err: any) {
      alert(err.message || 'GitHub sync failed.')
    } finally {
      setIsSyncing(false)
    }
  }, [loadProfile])

  const toggleSpotlight = useCallback(async (repoId: string) => {
    try {
      await githubService.toggleSpotlight(repoId)
      setProfile((prev: any) => {
        if (!prev) return prev
        return { ...prev, recentRepos: prev.recentRepos?.map((r: any) => r.id === repoId ? { ...r, isSpotlight: !r.isSpotlight } : r) }
      })
    } catch (err) { console.error(err) }
  }, [])

  const recentRepos = useMemo(() => profile?.recentRepos || [], [profile])

  // Profile display
  const displayName = dashProfile.displayName || user?.displayName || 'Developer'
  const avatarUrl = dashProfile.avatarUrl || user?.photoURL || null
  const jobTitle = dashProfile.title || 'Software Developer'
  const bio = dashProfile.bio || ''
  const location = dashProfile.location || ''
  const linkedinUrl = dashProfile.linkedinUrl || ''
  const ghLogin = dashGithub.login || ''

  const isReady = !loading && !skillsLoading

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-300">

      {/* ═══════════════════════════════════════════════════════════
          1. STATS
         ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Verified Skills", value: stats.verifiedSkills, icon: <Code size={20} />, color: "#6366f1" },
          { label: "Endorsements", value: stats.endorsements, icon: <Award size={20} />, color: "#f59e0b" },
          { label: "Contributions", value: stats.contributions, icon: <TrendingUp size={20} />, color: "#10b981" },
          { label: "GitHub Repos", value: stats.projects, icon: <FolderGit2 size={20} />, color: "#a855f7" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--text)] tabular-nums leading-none">
                {isReady ? s.value.toLocaleString() : '...'}
              </p>
              <p className="text-[11px] font-medium text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. ACHIEVEMENTS — Organized Badge Grid
         ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Award size={13} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)]">Achievements</h3>
          </div>
          <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-2.5 py-0.5 rounded-full">
            {badges?.length || 0} badges
          </span>
        </div>

        {isReady && badges && badges.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
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

              const lvlConfig: Record<number, { name: string, border: string, bg: string, text: string }> = {
                3: { name: "Senior", border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-500" },
                2: { name: "Middle", border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-500" },
                1: { name: "Junior", border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-500" },
              };
              const cfg = lvlConfig[lvl] || { name: "Verified", border: "border-[var(--border)]", bg: "bg-slate-500/10", text: "text-slate-400" };

              return (
                <div
                  key={idx}
                  onClick={() => setBadgeModal({ isOpen: true, badge })}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border ${cfg.border} bg-[var(--surface2)]/40 hover:bg-[var(--surface2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform">
                    <img
                      src={getSkillLogoUrl(badge.skillName || badge.name || '')}
                      className="w-7 h-7 object-contain"
                      alt=""
                      onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/8146/8146003.png' }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--text)] truncate w-full leading-tight">{badge.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} uppercase tracking-wider mt-1.5`}>
                    {cfg.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : isReady ? (
          <div className="text-center py-8 bg-[var(--surface2)]/30 rounded-xl border border-dashed border-[var(--border)]">
            <Award size={22} className="mx-auto mb-2 text-[var(--muted)]" />
            <p className="text-[11px] text-[var(--muted)]">ยังไม่มีเหรียญรางวัล — สะสมการรับรองเพื่อปลดล็อก</p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. ALL GITHUB REPOS
         ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Github size={13} className="text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)]">GitHub Repositories</h3>
          </div>
          <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-2.5 py-0.5 rounded-full">
            {recentRepos.length} repos
          </span>
        </div>

        {recentRepos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentRepos.map((repo: any, idx: number) => (
              <div
                key={idx}
                className={`group p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between min-h-[105px] ${repo.isSpotlight
                    ? 'border-indigo-500/30 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02]'
                    : 'border-[var(--border)] bg-[var(--surface2)]/40 hover:bg-[var(--surface2)]'
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Github size={13} className="text-[var(--muted)] shrink-0" />
                      <h4 className="text-xs font-bold text-[var(--text)] truncate">{repo.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleSpotlight(repo.id)}
                        className={`p-1 rounded cursor-pointer transition-colors ${repo.isSpotlight ? 'text-amber-500' : 'text-[var(--muted)] hover:text-amber-500'}`}
                        title={repo.isSpotlight ? "Remove Spotlight" : "Add Spotlight"}
                      >
                        <Star size={11} fill={repo.isSpotlight ? "currentColor" : "none"} />
                      </button>
                      <a href={repo.url} target="_blank" rel="noreferrer" className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                        <ArrowUpRight size={11} />
                      </a>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {repo.description || "ไม่มีรายละเอียด"}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--muted)] mt-3 pt-2 border-t border-[var(--border)]/50">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && <span>★ {repo.stars}</span>}
                  {repo.isSpotlight && (
                    <span className="ml-auto text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">★ Spotlight</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--surface2)]/30 rounded-xl border border-dashed border-[var(--border)]">
            <Github size={22} className="mx-auto mb-2 text-[var(--muted)]" />
            <p className="text-[11px] text-[var(--muted)]">เชื่อมต่อ GitHub เพื่อแสดงผลงานทั้งหมดของคุณ</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BADGE CERTIFICATE MODAL
         ═══════════════════════════════════════════════════════════ */}
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
          3: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20",
          2: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-500/20",
          1: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20"
        };
        const modalBorders: Record<number, string> = {
          3: "border-amber-500/30 dark:border-amber-500/20",
          2: "border-blue-500/30 dark:border-blue-500/20",
          1: "border-emerald-500/30 dark:border-emerald-500/20"
        };

        const credId = `skw-${String(activeBadge.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`;

        let dateStr = "ไม่ระบุวันที่";
        const unlockedAt = activeBadge.unlockedAt;
        if (unlockedAt) {
          let dateObj: Date | null = null;
          if (unlockedAt.seconds) dateObj = new Date(unlockedAt.seconds * 1000);
          else if (unlockedAt.toDate && typeof unlockedAt.toDate === "function") dateObj = unlockedAt.toDate();
          else dateObj = new Date(unlockedAt);
          if (dateObj && !isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        }

        const borderStyle = modalBorders[bLvl] || "border-slate-200 dark:border-[#30363d]";
        const labelStyle = lvlColors[bLvl] || "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10";

        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setBadgeModal({ isOpen: false, badge: null })}>
            <div className={`bg-white dark:bg-[#0d1117] border-2 ${borderStyle} rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden p-1`}
              onClick={e => e.stopPropagation()}>
              <div className="border border-slate-100 dark:border-[#21262d] rounded-xl p-6 relative">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Skill Certificate</span>
                  <button onClick={() => setBadgeModal({ isOpen: false, badge: null })}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer">
                    ✕
                  </button>
                </div>
                <div className="flex flex-col items-center text-center mt-4">
                  <div className="w-20 h-20 rounded-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-[#30363d] flex items-center justify-center shadow-sm relative mb-4 p-4">
                    <img src={getSkillLogoUrl(activeBadge.skillName || activeBadge.name || '')} alt={activeBadge.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback-modal-large");
                        if (fallback) fallback.classList.remove("hidden");
                      }} />
                    <div className="logo-fallback-modal-large hidden font-bold text-2xl text-slate-400 dark:text-[#8b949e] select-none">
                      {(activeBadge.skillName || activeBadge.name || 'SK').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0d1117] shadow">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{activeBadge.name}</h3>
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider mt-3 ${labelStyle}`}>
                    {lvlNames[bLvl] || "Verified"} Level
                  </span>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-xl p-4 border border-slate-100 dark:border-[#21262d] space-y-3 text-left">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Verification Details</p>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                        {activeBadge.description || `Successfully verified by Endorsements and AI Quiz at ${lvlNames[bLvl] || 'Expert'} Level.`}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">Issued: {dateStr}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-[#21262d] flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-[#161b22] border border-slate-200/50 dark:border-white/5 px-2 py-0.5 rounded">{credId}</p>
                      </div>
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