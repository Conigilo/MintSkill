"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/hooks/useAuth";
import { userService } from "@/lib/services/user.service";
import { githubService } from "@/lib/services/github.service";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import SkillsTab from "@/components/dashboard/tabs/SkillsTab";
import EndorsementsTab from "@/components/dashboard/tabs/EndorsementsTab";
import GapAnalysisTab from "@/components/dashboard/tabs/GapAnalysisTab";
import ExportPortfolioTab from "@/components/dashboard/tabs/exportPortfolioTab";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { useUserSkills, useMyEndorsements, useUserBadges } from "@/lib/hooks/useProfileData";
import CVTemplate from "@/components/dashboard/CVTemplate";
import Image from "next/image";
import { GitHubCalendar } from "react-github-calendar";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import { Alert } from "@/components/ui";
import NotificationBell from "@/components/dashboard/notifications/NotificationBell";

const TABS = ["Overview", "Skills", "Endorsements", "Gap Analysis", "Export Portfolio"] as const;

export default function DashboardPage() {
  const { user, loading: authLoading, linkGithubAccount } = useAuth();
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [profile, setProfile] = useState<{
    displayName?: string;
    title?: string;
    bio?: string;
    location?: string;
    linkedinUrl?: string;
    github?: { connected?: boolean; login?: string; repoCount?: number; totalContributions?: number; totalStars?: number };
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { skills } = useUserSkills(user?.uid);
  const { endorsements: myEndorsements } = useMyEndorsements();
  const { badges } = useUserBadges(user?.uid);

  const refreshProfile = () => {
    userService.getProfile().then((res) => {
      const data = res?.data || res?.user || res;
      if (data?.uid || data?.displayName) setProfile(data);
    }).catch(() => { });
  };

  useEffect(() => {
    if (authLoading || !user) return;
    refreshProfile();
  }, [user, authLoading]);

  // Support redirecting to specific tab from other pages (like Jobs)
  useEffect(() => {
    const redirectTab = localStorage.getItem('activeDashboardTab');
    if (redirectTab) {
      setActiveTab(redirectTab);
      localStorage.removeItem('activeDashboardTab');
    }
  }, []);

  return (
    <>
      <SidebarLayout activePage="profile">
        <div className="relative pb-12 print:hidden">
          {/* Background effects */}
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

          {/*Alert Message Area */}
          {error && (
            <div className="max-w-7xl mx-auto mt-24 px-8 mb-[-2rem] animate-in slide-in-from-top-4 duration-300">
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)} 
              />
            </div>
          )}

          {/* Main Dashboard Layout */}
          <div className="max-w-7xl mx-auto mt-8 px-8 relative z-10">
            {/* Profile + Tabs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 mt-14">
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
                          className="w-full h-full bg-white rounded-full object-cover border-4 border-[#090d14]"
                        />
                      ) : (
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-4xl font-bold text-slate-900 border-4 border-[#090d14]">
                          {user?.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#161b22] rounded-full" />
                  </div>
                  {/* ชื่อ + ปุ่มแก้ไข (spacer ซ้ายทำให้ชื่อ center จริงๆ) */}
                  <div className="flex justify-center items-center gap-1 mb-1">
                    <div className="w-5 h-5 flex-shrink-0" /> {/* spacer */}
                    <h2 className="text-2xl font-bold text-slate-900">{profile?.displayName || user?.displayName || "User"}</h2>
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Edit Profile"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm mb-1">{profile?.github?.login ? `@${profile.github.login}` : user?.email || "N/A"}</p>
                  <p className="text-blue-400 font-medium text-sm mb-3">{profile?.title || "Developer"}</p>
                  {profile?.location && (
                    <p className="text-xs text-slate-400 mb-2 flex items-center justify-center gap-1">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {profile.location}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 text-left mb-6">{profile?.bio || "Welcome to your Skill Wallet portfolio."}</p>

                </div>

                {/* GitHub Status Card */}
                <div className="glass-panel p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase">GitHub Status</h3>
                    {profile?.github?.connected ? (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/10 text-slate-400 border border-slate-300 px-2.5 py-1 rounded-full">Not connected</span>
                    )}
                  </div>

                  {profile?.github?.connected ? (
                    <>
                      <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between"><span className="text-slate-500">Repositories</span><span className="text-slate-900 font-mono">{profile?.github?.repoCount ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Contributions</span><span className="text-slate-900 font-mono">{profile?.github?.totalContributions ?? "—"}</span></div>
                        {profile?.github?.totalStars !== undefined && (
                          <div className="flex justify-between"><span className="text-slate-500">Stars</span><span className="text-slate-900 font-mono">{profile.github.totalStars}</span></div>
                        )}
                      </div>

                      {profile?.github?.login ? (
                        <div className="w-full overflow-x-auto mb-6 flex justify-center py-2 no-scrollbar">
                          <GitHubCalendar
                            username={profile.github.login}
                            blockSize={9}
                            blockMargin={3}
                            fontSize={10}
                            colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-4 mb-6 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="text-xs text-slate-500">Could not load calendar (Username missing)</p>
                        </div>
                      )}

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
                        className="w-full bg-slate-900 hover:bg-slate-800 text-[13px] text-white font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
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
                      <p className="text-[13px] text-slate-500 mb-4">Link GitHub to view your coding stats.</p>
                      <button
                        onClick={async () => {
                          try {
                            if (linkGithubAccount) {
                              await linkGithubAccount();
                              window.location.reload();
                            }
                          } catch (e: any) {
                            setError(e.message || "Failed to link GitHub account.");
                            console.error(e);
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-[13px] text-white font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 w-full"
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
                <div className="flex justify-between items-center border-b border-slate-200/50">
                  <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
                      >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                      </button>
                    ))}
                  </div>
                  <div className="pb-3 px-2">
                    <NotificationBell
                      pendingRequests={myEndorsements?.filter((e: any) => e.status === "pending") || []}
                      onNavigateToEndorseTab={() => setActiveTab("Endorsements")}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === "Overview" && <OverviewTab />}
                  {activeTab === "Skills" && <SkillsTab onNavigateToEndorse={() => setActiveTab("Endorsements")} />}
                  {activeTab === "Endorsements" && <EndorsementsTab />}
                  {activeTab === "Gap Analysis" && <GapAnalysisTab skills={skills || []} />}
                  {activeTab === "Export Portfolio" && <ExportPortfolioTab userName={user?.displayName || "user"} skills={skills || []} />}
                </div>
              </div>
            </div>

          </div>
        </div>
      </SidebarLayout>

      {/* CV Template for print - Added 'print-visible' to fix blank page issue */}
      <div className="hidden print:block print-visible">
        <CVTemplate user={user} skills={skills} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={refreshProfile}
        initialData={{
          displayName: profile?.displayName || user?.displayName || '',
          title: profile?.title || '',
          bio: profile?.bio || '',
          location: profile?.location || '',
          linkedinUrl: profile?.linkedinUrl || '',
        }}
      />
    </>
  );
}