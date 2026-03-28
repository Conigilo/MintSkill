'use client'

import { useState, useEffect } from 'react'
import { useUserSkills, useUserBadges, useMyEndorsements } from '@/hooks/useProfileData'
import { userService } from '@/lib/services/user.service'
import { useAuth } from '@/lib/hooks/useAuth'

export default function OverviewTab() {
  const { user, loading } = useAuth()
  const uid = user?.uid
  const { skills, isLoading: skillsLoading } = useUserSkills(uid)
  const { badges, isLoading: badgesLoading } = useUserBadges(uid)
  const { endorsements } = useMyEndorsements()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    verifiedSkills: 0,
    endorsements: 0,
    contributions: 0,
    projects: 0,
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return
      try {
        const data = await userService.getProfile()
        setProfile(data?.user || data?.data || data)
      } catch (error) {
        console.error('Error loading profile:', error)
        // Use current user from auth as fallback
        setProfile({
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
          photoURL: user?.photoURL
        })
      }
    }

    if (!loading && uid) {
      loadProfile()
    }
  }, [uid, loading])

  useEffect(() => {
    // Calculate stats from loaded data
    setStats({
      verifiedSkills: skills?.length || 0,
      endorsements: endorsements?.length || 0,
      contributions: profile?.contributions || 0,
      projects: profile?.projects?.length || 0,
    })
  }, [skills, endorsements, profile])

  const topSkills = skills?.slice(0, 5) || []
  const topBadges = badges?.slice(0, 4) || []

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
      {topBadges.length > 0 && (
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Earned Badges</h3>
            <span className="text-xs border border-gray-700 bg-gray-800/50 px-3 py-1.5 rounded-full text-gray-400">
              {topBadges.length} total
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topBadges.map((badge, idx) => (
              <div key={idx} className="bg-[#0d1117]/50 border border-gray-800 rounded-2xl p-4 text-center hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                <h4 className="text-sm font-semibold text-white">{badge.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}