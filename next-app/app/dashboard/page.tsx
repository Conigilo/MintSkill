"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { userService } from "@/lib/services/user.service";
import { githubService } from "@/lib/services/github.service";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import SkillsTab from "@/components/dashboard/tabs/SkillsTab";
import EndorsementsTab from "@/components/dashboard/tabs/EndorsementsTab";
import GapAnalysisTab from "@/components/dashboard/tabs/GapAnalysisTab";
import WidgetExportTab from "@/components/dashboard/tabs/WidgetExportTab";
import ChallengesTab from "@/components/dashboard/tabs/ChallengesTab";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { useUserSkills, useMyEndorsements } from "@/hooks/useProfileData";
import CVTemplate from "@/components/dashboard/CVTemplate";
import Image from "next/image";

const TABS = ["Overview", "Skills", "Endorsements", "Gap Analysis", "Developer Widgets"] as const;

export default function DashboardPage() {
  const { user, loading: authLoading, linkGithubAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [showInbox, setShowInbox] = useState(false);
  const [profile, setProfile] = useState<{
    displayName?: string;
    title?: string;
    bio?: string;
    github?: { connected?: boolean; login?: string; repoCount?: number; totalContributions?: number; totalStars?: number };
  } | null>(null);

  const { skills } = useUserSkills(user?.uid);
  const { endorsements: myEndorsements } = useMyEndorsements();
  type EndorsementWithStatus = { id: string; fromUserName?: string; skill: string; createdAt?: string; status?: string };
  const pendingEndorsements = (myEndorsements as EndorsementWithStatus[]).filter((e) => e.status === "pending");
  const inboxCount = pendingEndorsements.length;

  useEffect(() => {
    if (authLoading || !user) return;
    userService
      .getProfile()
      .then((res) => {
        const data = res?.data || res?.user || res;
        if (data?.uid || data?.displayName) setProfile(data);
      })
      .catch(() => {});
  }, [user, authLoading]);

  return (
    <>
      <SidebarLayout activePage="profile">
        <div className="relative pb-12 print:hidden">
          {/* Notification Bell */}
          <div className="absolute top-6 right-8 z-[100] hidden md:block">
            <div className="relative">
              <button
                onClick={() => setShowInbox(!showInbox)}
                className="bg-[#161b22] border border-gray-800 hover:border-blue-500/50 p-2.5 rounded-full text-gray-400 hover:text-white transition-all relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {inboxCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#090d14] text-[8px] font-bold flex items-center justify-center text-white animate-pulse">
                    {inboxCount}
                  </span>
                )}
              </button>

              {showInbox && (
                <div className="absolute top-12 right-0 w-80 bg-[#161b22] border border-gray-700 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#0d1117]">
                    <h4 className="font-bold text-white text-sm">Endorsement Requests</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{inboxCount} New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pendingEndorsements.length === 0 ? (
                      <p className="text-sm text-gray-500 p-6 text-center">No pending endorsements.</p>
                    ) : (
                      pendingEndorsements.map((req) => (
                        <div key={req.id} className="p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {req.fromUserName?.[0] ?? "?"}
                            </div>
                            <div>
                              <p className="text-sm text-gray-300">
                                Pending endorsement for <span className="text-blue-400 font-semibold">{req.skill}</span>
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background effects */}
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Profile + Tabs Layout */}
          <div className="max-w-7xl mx-auto mt-8 px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

            {/* Left Column: Profile Card + GitHub */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="glass-panel p-8 rounded-3xl text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={112}
                        height={112}
                        className="w-full h-full bg-[#161b22] rounded-full object-cover border-4 border-[#090d14]"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#161b22] rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-[#090d14]">
                        {user?.displayName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#161b22] rounded-full" />
                </div>
                <h2 className="text-2xl font-bold text-white">{profile?.displayName || user?.displayName || "User"}</h2>
                <p className="text-gray-400 text-sm mb-1">{profile?.github?.login ? `@${profile.github.login}` : user?.email || "N/A"}</p>
                <p className="text-blue-400 font-medium text-sm mb-6">{profile?.title || "Developer"}</p>
                <p className="text-sm text-gray-400 text-left mb-6">{profile?.bio || "Welcome to your Skill Wallet portfolio."}</p>

                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      try {
                        if (linkGithubAccount) {
                          await linkGithubAccount();
                          window.location.reload();
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="w-full bg-[#111110] hover:bg-[#1a1a19] text-white py-3 rounded-xl font-medium border border-gray-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/50"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    Sync GitHub
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all"
                  >
                    ↓ Export Portfolio
                  </button>
                </div>
              </div>

              {/* GitHub Status Card */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase">GitHub Status</h3>
                  {profile?.github?.connected ? (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Connected
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-500/10 text-gray-500 border border-gray-700 px-2.5 py-1 rounded-full">Not connected</span>
                  )}
                </div>

                {profile?.github?.connected ? (
                  <>
                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex justify-between"><span className="text-gray-400">Repositories</span><span className="text-white font-mono">{profile?.github?.repoCount ?? "—"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Contributions</span><span className="text-white font-mono">{profile?.github?.totalContributions ?? "—"}</span></div>
                      {profile?.github?.totalStars !== undefined && (
                        <div className="flex justify-between"><span className="text-gray-400">Stars</span><span className="text-white font-mono">{profile.github.totalStars}</span></div>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-1.5 mb-6">
                      {[...Array(36)].map((_, i) => {
                        const isHigh = (i * 17) % 10 > 7;
                        const isMedium = (i * 11) % 10 > 4;
                        return (
                          <div key={i} className={`w-full aspect-square rounded-sm transition-colors ${isHigh ? "bg-green-400" : isMedium ? "bg-green-700/50" : "bg-gray-800"}`} />
                        );
                      })}
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await githubService.syncGitHub();
                          window.location.reload();
                        } catch (e: any) {
                          console.error("Sync failed:", e);
                          alert("GitHub Sync Failed: " + (e.message || "Token might be expired. Please click Sync GitHub again or re-login."));
                        }
                      }}
                      className="w-full bg-[#111110] hover:bg-[#1a1a19] text-[13px] text-white font-medium px-4 py-2.5 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Sync GitHub Stats
                    </button>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-[13px] text-gray-400 mb-4">Link GitHub to view your coding stats.</p>
                    <button
                      onClick={async () => {
                        try {
                          if (linkGithubAccount) {
                            await linkGithubAccount();
                            window.location.reload();
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="bg-[#111110] hover:bg-[#1a1a19] text-[13px] text-white font-medium px-4 py-2.5 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2 w-full"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      Connect GitHub
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Tabs */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex gap-6 border-b border-gray-800/50 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "Overview" && <OverviewTab />}
                {activeTab === "Skills" && <SkillsTab onNavigateToEndorse={() => setActiveTab("Endorsements")} />}
                {activeTab === "Endorsements" && <EndorsementsTab />}
                {activeTab === "Gap Analysis" && <GapAnalysisTab skills={skills || []} />}
                {activeTab === "Developer Widgets" && <WidgetExportTab userName={user?.displayName || "user"} />}
              </div>
            </div>

          </div>
        </div>
      </SidebarLayout>

      {/* CV Template for print */}
      <div className="hidden print:block">
        <CVTemplate />
      </div>
    </>
  );
}