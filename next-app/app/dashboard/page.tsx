"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
// Import Components ที่เราแยกไว้
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import SkillsTab from "@/components/dashboard/tabs/SkillsTab";
import EndorsementsTab from "@/components/dashboard/tabs/EndorsementsTab";
import GapAnalysisTab from "@/components/dashboard/tabs/GapAnalysisTab";
import WidgetExportTab from "@/components/dashboard/tabs/WidgetExportTab";
import CVTemplate from "@/components/dashboard/CVTemplate";
import { skillService } from "@/lib/services/skills.service";
import { githubService } from '@/lib/services/github.service';
import { userService } from '@/lib/services/user.service';

export default function DashboardPage() {

  const router = useRouter();
  const { user, logout } = useAuth();
  const [exploreFilter, setExploreFilter] = useState("All");
  const [jobsFilter, setJobsFilter] = useState("ทั้งหมด");
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Skills", "Endorsements", "Gap Analysis", "Developer Widgets"];
  const [showInbox, setShowInbox] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ skill: "React", recipient: "", message: "" });
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer");
  const [githubStats, setGithubStats] = useState<{ repos?: number; contributions?: number } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // ดึง profile จาก backend
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      try {
        const profileRes = await userService.getProfile();
        setProfile(profileRes?.data || profileRes?.user || profileRes);
      } catch (e) {
        // fallback to auth data
        setProfile(user);
      }
      try {
        const ghRes = await githubService.getMyRepos();
        const repos = ghRes?.data;
        if (repos) {
          setGithubStats({ repos: repos.length, contributions: repos.reduce((sum: number, r: any) => sum + (r.stargazersCount || 0), 0) });
        }
      } catch (e) {
        // GitHub not connected yet
      }
    };
    loadData();
  }, [user?.uid]);

  const displayName = profile?.displayName || user?.displayName || 'User';
  const avatarLetter = displayName[0]?.toUpperCase() || 'U';
  const username = profile?.username || profile?.email?.split('@')[0] || '';
  const bio = profile?.bio || '';
  const isGitHubConnected = !!githubStats;

  const menuItems = [
    { label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Explore", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
    { label: "Jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/");
    }
  };

  const pendingRequests = [
    { id: 1, name: "Nadech K.", role: "Frontend Dev", skill: "React", time: "2 hours ago" },
    { id: 2, name: "Yaya U.", role: "Data Scientist", skill: "Python", time: "5 hours ago" },
  ];

  const exploreDevelopers = [
    { id: "u1", name: "Nadech Kugimiya", username: "@nadech_dev", role: "Frontend Engineer", avatar: "N", color: "bg-blue-500", topSkills: [{ name: "React", verified: true, level: 8 }, { name: "TypeScript", verified: true, level: 7 }], endorsements: 15, matchScore: 80 },
    { id: "u2", name: "Yaya Urassaya", username: "@yaya_data", role: "Data Scientist", avatar: "Y", color: "bg-purple-500", topSkills: [{ name: "Python", verified: true, level: 9 }], endorsements: 24, matchScore: 30 },
  ];

  const jobPostings = [
    { id: "j1", company: "SCB TechX", role: "Software Engineer (Internship)", location: "Bangkok, Hybrid", salary: "฿15,000 - ฿20,000", requiredSkills: ["JavaScript", "React", "Node.js"], matchScore: 95, status: "Highly Recommended" },
    { id: "j2", company: "KBTG", role: "Backend Developer (New Grad)", location: "Bangkok, On-site", salary: "฿35,000 - ฿45,000", requiredSkills: ["Go", "System Design", "PostgreSQL"], matchScore: 60, status: "Skill Gap Detected" },
  ];
  return (
    <>
      {/* 1. แบ่ง Layout หลักเป็น Flex (ซ้าย=Sidebar, ขวา=Main Content) */}
      <div className="flex min-h-screen bg-[#090d14] text-gray-200 font-sans print:hidden">

        {/* ================= 2. Left Sidebar (เมนูด้านซ้าย) ================= */}
        <aside className="w-64 border-r border-gray-800/50 bg-[#0d1117] hidden md:flex flex-col p-6 sticky top-0 h-screen z-50">
          <div className="mb-10 pl-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
              SKILL WALLET
            </span>
          </div>
          <nav className="flex-1 space-y-2 mt-4">
            {/* ปุ่ม Profile */}
            <button
              onClick={() => setActiveMenu("Profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeMenu === "Profile" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-500 hover:text-white hover:bg-gray-800/30"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Profile
            </button>

            {/* ปุ่ม Explore */}
            <button
              onClick={() => setActiveMenu("Explore")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeMenu === "Explore" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-500 hover:text-white hover:bg-gray-800/30"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              Explore
            </button>

            {/* ปุ่ม Jobs */}
            <button
              onClick={() => setActiveMenu("Jobs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeMenu === "Jobs" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-500 hover:text-white hover:bg-gray-800/30"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Jobs
            </button>
          </nav>
          {/* ย้าย Sign Out มาไว้ล่างสุดของ Sidebar */}
          <div className="border-t border-gray-800/50 pt-4 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm bg-[#161b22] hover:bg-gray-800 border border-gray-700 text-gray-300 px-5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ================= 3. Main Content (พื้นที่ด้านขวา) ================= */}
        <main className="flex-1 overflow-y-auto relative pb-12 h-screen">
          <div className="absolute top-6 right-8 z-[100] hidden md:block">
            <div className="relative">
              {/* ปุ่มกระดิ่ง */}
              <button
                onClick={() => setShowInbox(!showInbox)}
                className="bg-[#161b22] border border-gray-800 hover:border-blue-500/50 p-2.5 rounded-full text-gray-400 hover:text-white transition-all relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {/* จุดแดงแจ้งเตือน */}
                {inboxCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#090d14] text-[8px] font-bold flex items-center justify-center text-white animate-pulse">
                    {inboxCount}
                  </span>
                )}
              </button>

              {/* Dropdown กล่องข้อความ */}
              {showInbox && (
                <div className="absolute top-12 right-0 w-80 bg-[#161b22] border border-gray-700 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#0d1117]">
                    <h4 className="font-bold text-white text-sm">Endorsement Requests</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{inboxCount} New</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {pendingRequests.length === 0 ? (
                      <p className="text-sm text-gray-500 p-6 text-center">No pending requests.</p>
                    ) : (
                      pendingRequests.map(req => (
                        <div key={req.id} className="p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">{req.name[0]}</div>
                            <div>
                              <p className="text-sm text-gray-300"><span className="font-bold text-white">{req.name}</span> asked you to endorse their <span className="text-blue-400 font-semibold">{req.skill}</span> skill.</p>
                              <p className="text-[10px] text-gray-500 mt-1">{req.time}</p>
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => setInboxCount(prev => Math.max(0, prev - 1))} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex-1">Endorse</button>
                                <button onClick={() => setInboxCount(prev => Math.max(0, prev - 1))} className="text-xs bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg transition-colors flex-1">Ignore</button>
                              </div>
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
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Header สำหรับมือถือ (ถ้าจอเล็ก Sidebar จะซ่อน แล้วแสดงอันนี้แทน) */}
          <header className="md:hidden border-b border-gray-800/50 p-4 flex justify-between items-center bg-[#090d14]/80 backdrop-blur-md sticky top-0 z-50">
            <span className="font-bold text-white">skillwallet.</span>
            <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg">Menu</button>
          </header>

          {/* ---------------- โครงสร้าง Profile + Tabs ---------------- */}
          {activeMenu === "Profile" && (
            <div className="max-w-7xl mx-auto mt-8 px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

              {/* คอลัมน์ซ้าย (Profile & GitHub Stats) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-8 rounded-3xl text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover border-4 border-[#090d14]" />
                      ) : (
                        <div className="w-full h-full bg-[#161b22] rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-[#090d14]">{avatarLetter}</div>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#161b22] rounded-full"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  {username && <p className="text-gray-400 text-sm mb-1">@{username}</p>}
                  {profile?.title && <p className="text-blue-400 font-medium text-sm mb-6">{profile.title}</p>}
                  {bio && <p className="text-sm text-gray-400 text-left mb-6">{bio}</p>}

                  <div className="space-y-3">
                    <button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25">Request Endorsement</button>
                    <button
                      onClick={() => window.print()}
                      className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all"
                    >
                      ↓ Export Portfolio
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase">GitHub Status</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
                      isGitHubConnected
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-gray-700/30 text-gray-500 border-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ isGitHubConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                      {isGitHubConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-gray-400">Repositories</span><span className="text-white font-mono">{githubStats?.repos ?? '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Stars</span><span className="text-white font-mono">{githubStats?.contributions ?? '—'}</span></div>
                  </div>

                  {/* Mock Contribution Graph (แก้ Hydration Error แล้ว) */}
                  <div className="grid grid-cols-12 gap-1.5">
                    {[...Array(36)].map((_, i) => {
                      const isHigh = (i * 17) % 10 > 7;
                      const isMedium = (i * 11) % 10 > 4;
                      return (
                        <div key={i} className={`w-full aspect-square rounded-sm transition-colors ${isHigh ? 'bg-green-400' : isMedium ? 'bg-green-700/50' : 'bg-gray-800'}`}></div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* คอลัมน์ขวา (Tabs & Component Content) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex gap-6 border-b border-gray-800/50 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                      {tab}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {activeTab === "Overview" && <OverviewTab />}
                  {activeTab === "Skills" && <SkillsTab />}
                  {activeTab === "Endorsements" && <EndorsementsTab />}
                  {activeTab === "Gap Analysis" && (
                    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">

                      {/* 1. Header & Dropdown เลือกสายงาน */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800/50 pb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">Skill Gap Analysis</h3>
                          <p className="text-sm text-gray-400 mt-1">เปรียบเทียบสกิลของคุณกับสายงานที่สนใจ</p>
                        </div>

                        <div className="flex items-center gap-3 bg-[#090d14] border border-gray-700 p-1.5 rounded-xl">
                          <span className="text-xs text-gray-400 font-bold pl-3 uppercase tracking-wider">Target Role:</span>
                          <select
                            className="bg-transparent text-white text-sm font-bold focus:outline-none pr-4 py-1.5 cursor-pointer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                          >
                            <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                            <option value="Data Scientist">Data Scientist / AI</option>
                            <option value="QA Automation">QA Automation Engineer</option>
                            <option value="Quant Developer">Quantitative Developer</option>
                          </select>
                        </div>
                      </div>

                      {/* 2. Logic & Data: ข้อมูลเป้าหมายและสกิลปัจจุบัน */}
                      {(() => {
                        // สมมติสกิลที่เรามี (Base Skills)
                        const mySkills: Record<string, number> = {
                          "React": 85, "Node.js": 75, "JavaScript": 90, "Python": 65,
                          "C++": 80, "SQL": 70, "Testing": 45, "Finance/Math": 60, "System Design": 50
                        };

                        // ข้อมูล Requirements ของแต่ละสายงาน
                        const rolesData: Record<string, { desc: string; requirements: { name: string; req: number }[] }> = {
                          "Full-Stack Engineer": {
                            desc: "เน้นการพัฒนา Web Application ทั้งหน้าบ้านและหลังบ้าน",
                            requirements: [
                              { name: "JavaScript", req: 90 },
                              { name: "React", req: 85 },
                              { name: "Node.js", req: 80 },
                              { name: "System Design", req: 70 },
                              { name: "SQL", req: 65 }
                            ]
                          },
                          "Data Scientist": {
                            desc: "เน้นการวิเคราะห์ข้อมูลและสร้างโมเดล Machine Learning",
                            requirements: [
                              { name: "Python", req: 90 },
                              { name: "SQL", req: 85 },
                              { name: "Finance/Math", req: 80 },
                              { name: "React", req: 40 }
                            ]
                          },
                          "QA Automation": {
                            desc: "เน้นการเขียนสคริปต์ทดสอบระบบและรับประกันคุณภาพซอฟต์แวร์",
                            requirements: [
                              { name: "Testing", req: 90 },
                              { name: "Python", req: 75 },
                              { name: "JavaScript", req: 70 },
                              { name: "Node.js", req: 50 }
                            ]
                          },
                          "Quant Developer": {
                            desc: "เน้นการเขียนโปรแกรมเพื่อการลงทุนและสร้าง Algorithmic Trading",
                            requirements: [
                              { name: "C++", req: 90 },
                              { name: "Python", req: 85 },
                              { name: "Finance/Math", req: 85 },
                              { name: "System Design", req: 60 }
                            ]
                          }
                        };

                        const currentRole = rolesData[targetRole];

                        // คำนวณความพร้อมโดยรวม (Overall Match Score)
                        let totalScore = 0;
                        let maxScore = 0;
                        currentRole.requirements.forEach(req => {
                          const myLevel = mySkills[req.name] || 0;
                          totalScore += Math.min(myLevel, req.req); // ไม่นับคะแนนที่เกินความจำเป็น
                          maxScore += req.req;
                        });
                        const matchPercentage = Math.round((totalScore / maxScore) * 100);

                        return (
                          <div className="space-y-6">

                            {/* กล่องสรุปคะแนนความพร้อม */}
                            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-bold mb-1">{targetRole}</h4>
                                <p className="text-sm text-gray-400">{currentRole.desc}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Overall Match</div>
                                <div className={`text-3xl font-black ${matchPercentage >= 80 ? 'text-green-400' : matchPercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {matchPercentage}%
                                </div>
                              </div>
                            </div>

                            {/* ลิสต์หลอดพลังแต่ละสกิล */}
                            <div className="space-y-5">
                              {currentRole.requirements.map((req, idx) => {
                                const myLevel = mySkills[req.name] || 0;
                                const gap = req.req - myLevel;

                                // กำหนดสีและสถานะตาม Gap
                                let statusText = "";
                                let barColor = "";

                                if (gap <= 0) {
                                  statusText = "Ready"; barColor = "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
                                } else if (gap <= 15) {
                                  statusText = "Minor Gap"; barColor = "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
                                } else {
                                  statusText = "Major Gap"; barColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
                                }

                                return (
                                  <div key={idx} className="bg-[#161b22] p-4 rounded-xl border border-gray-800/50">
                                    <div className="flex justify-between items-end mb-2">
                                      <div>
                                        <span className="text-white font-bold text-sm">{req.name}</span>
                                        <span className="text-gray-500 text-xs ml-2">Req: {req.req}%</span>
                                      </div>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${gap <= 0 ? "text-green-400 border-green-500/30 bg-green-500/10" :
                                        gap <= 15 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                                          "text-red-400 border-red-500/30 bg-red-500/10"
                                        }`}>
                                        {statusText} {gap > 0 && `(-${gap}%)`}
                                      </span>
                                    </div>

                                    {/* หลอดพลังซ้อนกัน (เป้าหมาย vs ปัจจุบัน) */}
                                    <div className="relative w-full h-2.5 bg-[#090d14] rounded-full overflow-hidden border border-gray-800">
                                      {/* เส้นประเป้าหมายที่ต้องการ */}
                                      <div
                                        className="absolute top-0 bottom-0 border-r-2 border-dashed border-gray-400/50 z-10"
                                        style={{ left: `${req.req}%` }}
                                      ></div>

                                      {/* หลอดความสามารถของเรา (มี Animation เวลากดสลับสายงาน) */}
                                      <div
                                        className={`absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                        style={{ width: `${myLevel}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* คำแนะนำ AI ด้านล่าง */}
                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
                              <span className="text-xl">💡</span>
                              <p className="text-sm text-blue-200 leading-relaxed">
                                <strong className="text-blue-400">AI Suggestion:</strong> เพื่อให้พร้อมสำหรับตำแหน่ง {targetRole} คุณควรโฟกัสที่การทำโปรเจคที่เกี่ยวข้องกับ <strong className="text-white">{currentRole.requirements.sort((a, b) => (b.req - (mySkills[b.name] || 0)) - (a.req - (mySkills[a.name] || 0)))[0].name}</strong> เพื่อปิด Skill Gap ที่ใหญ่ที่สุด
                              </p>
                            </div>

                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ================= แท็บ Developer Widgets (The Killer Feature) ================= */}
                  {activeTab === "Developer Widgets" && (
                    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">

                      {/* Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800/50 pb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                            Developer Widgets
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">Embed your verified skills on your GitHub Readme or personal website.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* ฝั่งซ้าย: Widget Preview (จำลองหน้าตา Widget) */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Preview</h4>
                          <div className="bg-[#090d14] border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group">
                            {/* แสง Glow ด้านหลัง */}
                            <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>

                            {/* ตัว Widget จำลอง */}
                            <div className="bg-[#161b22] border border-gray-800 p-4 rounded-xl shadow-2xl relative z-10 w-full max-w-sm">
                              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">F</div>
                                  <div>
                                    <p className="text-xs font-bold text-white">Sarit S.</p>
                                    <p className="text-[9px] text-green-400">12 Verified Skills</p>
                                  </div>
                                </div>
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded">React</span>
                                <span className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded">Node.js</span>
                                <span className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded">Python</span>
                                <span className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded">C++</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ฝั่งขวา: Code Snippets (โค้ดให้ก๊อปปี้) */}
                        <div className="space-y-6">

                          {/* Markdown สำหรับ GitHub */}
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">GitHub Readme (Markdown)</h4>
                              <button
                                onClick={() => alert("Copied to clipboard!")}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Copy Code
                              </button>
                            </div>
                            <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto relative group">
                              <code className="text-xs text-gray-300 font-mono whitespace-nowrap">
                                [![Skill Wallet](https://skillwallet.dev/api/widget/fiu_dev?theme=dark)](https://skillwallet.dev/fiu_dev)
                              </code>
                            </div>
                          </div>

                          {/* HTML Iframe สำหรับเว็บส่วนตัว */}
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Website Embed (HTML Iframe)</h4>
                              <button
                                onClick={() => alert("Copied to clipboard!")}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                Copy Code
                              </button>
                            </div>
                            <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto relative group">
                              <code className="text-xs text-blue-300 font-mono whitespace-nowrap">
                                &lt;iframe <br />
                                &nbsp;&nbsp;src="https://skillwallet.dev/embed/fiu_dev" <br />
                                &nbsp;&nbsp;width="350" <br />
                                &nbsp;&nbsp;height="180" <br />
                                &nbsp;&nbsp;frameborder="0" <br />
                                &nbsp;&nbsp;scrolling="no"<br />
                                &gt;&lt;/iframe&gt;
                              </code>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* ถ้ากดหน้า Explore ให้โชว์ Component Explore */}
          {/* ================= แท็บ Explore (Teammate Finder) ================= */}
          {activeMenu === "Explore" && (
            <div className="max-w-7xl mx-auto mt-8 px-8 relative z-10 animate-in fade-in duration-500 pb-20">

              {/* 1. Header & Sub-tabs */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-800/50 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-baseline gap-3">
                    Explore <span className="text-xl text-purple-500">Teammate Finder</span>
                  </h2>

                  {/* ระบบกดเลือก Tab (Filter) */}
                  <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {["All", "Frontend", "Backend", "Full-Stack", "Data & AI"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setExploreFilter(tab)}
                        className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all ${exploreFilter === tab
                          ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]"
                          : "bg-[#161b22] border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ช่อง Search */}
                <div className="flex gap-2 w-full md:w-auto relative">
                  <input
                    type="text"
                    placeholder="ค้นหาจากชื่อ หรือ ทักษะ..."
                    className="w-full md:w-80 bg-[#090d14] border border-gray-700 rounded-full px-5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Grid Cards (แสดงผล 16 รายการ) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[
                  { id: 1, name: "Nadech K.", role: "Frontend", title: "React Specialist", avatar: "N", color: "bg-blue-500", skills: ["React", "Tailwind", "UX/UI"], match: 95, verified: 4 },
                  { id: 2, name: "Yaya U.", role: "Data & AI", title: "ML Engineer", avatar: "Y", color: "bg-pink-500", skills: ["Python", "TensorFlow", "SQL"], match: 40, verified: 6 },
                  { id: 3, name: "Sompong T.", role: "Backend", title: "API Architect", avatar: "S", color: "bg-green-500", skills: ["Node.js", "Go", "Redis"], match: 88, verified: 3 },
                  { id: 4, name: "Kittiphat M.", role: "Full-Stack", title: "Next.js Ninja", avatar: "K", color: "bg-purple-500", skills: ["Next.js", "Prisma", "AWS"], match: 75, verified: 5 },
                  { id: 5, name: "Anan S.", role: "Backend", title: "System Design Pro", avatar: "A", color: "bg-yellow-500", skills: ["Java", "Spring Boot", "Kafka"], match: 60, verified: 8 },
                  { id: 6, name: "Siriporn K.", role: "Frontend", title: "CSS Wizard", avatar: "S", color: "bg-teal-500", skills: ["Vue.js", "SCSS", "Figma"], match: 82, verified: 2 },
                  { id: 7, name: "Piyapat T.", role: "Data & AI", title: "Data Scientist", avatar: "P", color: "bg-indigo-500", skills: ["R", "Pandas", "PowerBI"], match: 30, verified: 4 },
                  { id: 8, name: "Chaiyut W.", role: "Full-Stack", title: "Web Quant Builder", avatar: "C", color: "bg-red-500", skills: ["React", "Python", "Finance"], match: 98, verified: 7 },
                  { id: 9, name: "Wandee J.", role: "Backend", title: "Database Admin", avatar: "W", color: "bg-orange-500", skills: ["PostgreSQL", "MongoDB", "C++"], match: 55, verified: 3 },
                  { id: 10, name: "Nawat P.", role: "Frontend", title: "Mobile Developer", avatar: "N", color: "bg-cyan-500", skills: ["Flutter", "Dart", "Firebase"], match: 65, verified: 5 },
                  { id: 11, name: "Tanya R.", role: "Full-Stack", title: "MERN Stack Dev", avatar: "T", color: "bg-rose-500", skills: ["MongoDB", "Express", "React"], match: 85, verified: 4 },
                  { id: 12, name: "Veera S.", role: "Data & AI", title: "AI Researcher", avatar: "V", color: "bg-emerald-500", skills: ["PyTorch", "NLP", "Math"], match: 45, verified: 9 },
                  { id: 13, name: "Arnon B.", role: "Backend", title: "Security Expert", avatar: "A", color: "bg-slate-500", skills: ["CyberSec", "Linux", "Python"], match: 50, verified: 6 },
                  { id: 14, name: "Mali D.", role: "Frontend", title: "Web Accessibility", avatar: "M", color: "bg-fuchsia-500", skills: ["HTML5", "A11y", "JS"], match: 70, verified: 2 },
                  { id: 15, name: "Phop K.", role: "Full-Stack", title: "Startup Founder", avatar: "P", color: "bg-sky-500", skills: ["Svelte", "Supabase", "Stripe"], match: 78, verified: 5 },
                  { id: 16, name: "Linda C.", role: "Data & AI", title: "Data Analyst", avatar: "L", color: "bg-lime-500", skills: ["Excel", "Tableau", "SQL"], match: 35, verified: 3 },
                ]
                  // 👉 นี่คือหัวใจหลัก: กรองข้อมูลตาม Tab ที่กด!
                  .filter(dev => exploreFilter === "All" ? true : dev.role === exploreFilter)
                  .map(dev => (
                    <div key={dev.id} className="bg-[#161b22] border border-gray-800/80 p-5 rounded-3xl hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.15)] transition-all flex flex-col relative group">

                      {/* Badge จำนวนสกิลที่ Verified แล้ว มุมขวาบน */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full cursor-help" title={`${dev.verified} Verified Skills`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {dev.verified}
                      </div>

                      {/* Profile Info */}
                      <div className="flex gap-4 items-center mb-5 mt-2">
                        <div className={`w-14 h-14 rounded-2xl ${dev.color} flex items-center justify-center font-bold text-2xl text-white shadow-inner`}>{dev.avatar}</div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">{dev.name}</h3>
                          <p className="text-xs text-purple-400 font-medium">{dev.title}</p>
                        </div>
                      </div>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {dev.skills.map((skill, i) => (
                          <span key={i} className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded-md">{skill}</span>
                        ))}
                      </div>

                      {/* Match Score Bar */}
                      <div className="mt-auto pt-4 border-t border-gray-800/50">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Team Synergy</span>
                          <span className={`text-xs font-bold ${dev.match >= 80 ? 'text-green-400' : dev.match >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{dev.match}%</span>
                        </div>
                        <div className="w-full bg-[#090d14] rounded-full h-1.5 mb-4 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${dev.match >= 80 ? 'bg-green-400' : dev.match >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${dev.match}%` }}></div>
                        </div>

                        {/* ปุ่ม Connect */}
                        <button className="w-full bg-transparent border border-gray-600 hover:bg-white hover:text-black hover:border-white text-gray-300 font-bold py-2 rounded-xl text-xs transition-all flex justify-center items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}


          {/* ถ้ากดหน้า Jobs ให้โชว์ Component Jobs */}
          {/* ================= แท็บ Jobs ================= */}
          {activeMenu === "Jobs" && (
            <div className="max-w-7xl mx-auto mt-8 px-8 relative z-10 animate-in fade-in duration-500 pb-20">

              {/* 1. Top Section: Header & Sub-tabs */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-800/50 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-baseline gap-3">
                    งานทั้งหมด <span className="text-xl text-blue-500">16 ตำแหน่ง</span>
                  </h2>

                  {/* ระบบกดเลือก Tab (Filter ประเภทงาน) */}
                  <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {["ทั้งหมด", "ฝึกงาน", "งานประจำ", "พาร์ทไทม์", "ฟรีแลนซ์"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setJobsFilter(tab)}
                        className={`px-5 py-1.5 text-sm font-bold rounded-full transition-all ${jobsFilter === tab
                          ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                          : "bg-[#161b22] border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ช่อง Search */}
                <div className="flex gap-2 w-full md:w-auto relative">
                  <input
                    type="text"
                    placeholder="ค้นหาตำแหน่งงาน..."
                    className="w-full md:w-80 bg-[#090d14] border border-gray-700 rounded-full px-5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <button className="absolute right-1 top-1 bg-blue-600 p-1.5 rounded-full text-white hover:bg-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </button>
                </div>
              </div>

              {/* 2. Grid Job Cards (Layout แบบ 4 คอลัมน์) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[
                  { id: 1, company: "SCB TechX", role: "Frontend Developer", loc: "Bangkok - Hybrid", type: "ฝึกงาน", pay: "15,000 - 20,000 ฿", time: "1 ชั่วโมงที่ผ่านมา", hot: true, color: "bg-purple-600", req: ["React", "JavaScript", "HTML/CSS"], match: 95 },
                  { id: 2, company: "Agoda", role: "Full-Stack Engineer", loc: "Bangkok - Remote", type: "งานประจำ", pay: "60k - 100k ฿", time: "2 ชั่วโมงที่ผ่านมา", hot: false, color: "bg-blue-500", req: ["C#", "React", "Algorithms"], match: 65 },
                  { id: 3, company: "LINE Thailand", role: "Backend Engineer", loc: "Bangkok - Onsite", type: "งานประจำ", pay: "45k - 80k ฿", time: "3 ชั่วโมงที่ผ่านมา", hot: true, color: "bg-green-500", req: ["Go", "Kafka", "Redis"], match: 40 },
                  { id: 4, company: "KBTG", role: "QA Automation Intern", loc: "Nonthaburi - Hybrid", type: "ฝึกงาน", pay: "10,000 - 15,000 ฿", time: "5 ชั่วโมงที่ผ่านมา", hot: false, color: "bg-teal-500", req: ["Testing", "Automate", "Python"], match: 80 },
                  { id: 5, company: "InnovestX", role: "Quant Developer", loc: "Bangkok - Hybrid", type: "งานประจำ", pay: "50k - 90k ฿", time: "1 วันที่ผ่านมา", hot: true, color: "bg-indigo-600", req: ["Python", "C++", "Finance"], match: 88 },
                  { id: 6, company: "Wongnai", role: "Web Developer", loc: "Bangkok - Onsite", type: "พาร์ทไทม์", pay: "300 ฿/ชม.", time: "1 วันที่ผ่านมา", hot: false, color: "bg-blue-600", req: ["React", "Tailwind", "UX/UI"], match: 92 },
                  { id: 7, company: "Bitkub", role: "Smart Contract Dev", loc: "Bangkok - Remote", type: "งานประจำ", pay: "70k - 120k ฿", time: "2 วันที่ผ่านมา", hot: true, color: "bg-green-600", req: ["Solidity", "Web3", "Node.js"], match: 50 },
                  { id: 8, company: "Shopee", role: "Backend Intern", loc: "Bangkok - Hybrid", type: "ฝึกงาน", pay: "15,000 ฿", time: "2 วันที่ผ่านมา", hot: false, color: "bg-orange-500", req: ["Java", "Spring", "MySQL"], match: 60 },
                  { id: 9, company: "LMWN", role: "Data Engineer Intern", loc: "Bangkok - Hybrid", type: "ฝึกงาน", pay: "15,000 ฿", time: "3 วันที่ผ่านมา", hot: false, color: "bg-sky-500", req: ["Python", "SQL", "Airflow"], match: 45 },
                  { id: 10, company: "Fastwork", role: "Full-Stack Dev", loc: "Remote", type: "ฟรีแลนซ์", pay: "ตามตกลง", time: "3 วันที่ผ่านมา", hot: true, color: "bg-yellow-600", req: ["Next.js", "Node.js", "MongoDB"], match: 85 },
                  { id: 11, company: "Ascend", role: "DevOps Engineer", loc: "Bangkok - Onsite", type: "งานประจำ", pay: "40k - 75k ฿", time: "4 วันที่ผ่านมา", hot: false, color: "bg-red-500", req: ["AWS", "Docker", "CI/CD"], match: 30 },
                  { id: 12, company: "Garena", role: "Game Backend Dev", loc: "Bangkok - Hybrid", type: "งานประจำ", pay: "50k - 85k ฿", time: "4 วันที่ผ่านมา", hot: false, color: "bg-red-600", req: ["C++", "Go", "Algorithms"], match: 70 },
                  { id: 13, company: "Odds", role: "Agile Developer", loc: "Bangkok - Remote", type: "งานประจำ", pay: "45k - 90k ฿", time: "5 วันที่ผ่านมา", hot: true, color: "bg-neutral-600", req: ["JavaScript", "TDD", "Pair Prog"], match: 75 },
                  { id: 14, company: "Boutique", role: "E-Commerce Web Dev", loc: "Remote", type: "ฟรีแลนซ์", pay: "20,000 ฿/โปรเจค", time: "5 วันที่ผ่านมา", hot: false, color: "bg-pink-500", req: ["HTML/CSS", "JS", "Vanilla"], match: 98 },
                  { id: 15, company: "Tencent", role: "Cloud Solutions", loc: "Bangkok - Onsite", type: "งานประจำ", pay: "60k - 110k ฿", time: "1 สัปดาห์ที่ผ่านมา", hot: false, color: "bg-blue-700", req: ["Cloud", "System Design", "Linux"], match: 40 },
                  { id: 16, company: "KFC Thailand", role: "IT Support Part-time", loc: "Bangkok", type: "พาร์ทไทม์", pay: "10,000 ฿", time: "1 สัปดาห์ที่ผ่านมา", hot: false, color: "bg-red-500", req: ["Network", "Hardware", "Service"], match: 20 },
                ]
                  // 👉 ตัวกรอง Filter: เช็คว่ากด "ทั้งหมด" หรือกดตามประเภทงาน
                  .filter(job => jobsFilter === "ทั้งหมด" ? true : job.type === jobsFilter)
                  .map(job => (
                    <div key={job.id} className="bg-[#161b22] border border-gray-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all flex flex-col relative group cursor-pointer shadow-lg shadow-black/20">

                      {/* ป้ายรับด่วน มุมขวาบน */}
                      {job.hot && <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-md z-10">รับด่วน</div>}

                      {/* โลโก้ และ ชื่อบริษัท */}
                      <div className="flex gap-3 items-center mb-4 mt-2">
                        <div className={`w-10 h-10 rounded-full ${job.color} flex items-center justify-center font-bold text-white shrink-0 shadow-inner`}>{job.company[0]}</div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-300 truncate">{job.company}</p>
                          <p className="text-[10px] text-gray-500 truncate">{job.loc}</p>
                        </div>
                      </div>

                      {/* ชื่อตำแหน่งงาน */}
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors">{job.role}</h3>

                      {/* ป้ายประเภทงาน */}
                      <div className="mb-4">
                        <span className="text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md">{job.type}</span>
                      </div>

                      {/* ระบบ Match Score ของ Skill Wallet (หลอดพลัง) */}
                      <div className="mb-5 bg-[#090d14] p-3 rounded-xl border border-gray-800/50">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Skill Match</span>
                          <span className={`text-xs font-bold ${job.match >= 80 ? 'text-green-400' : job.match >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{job.match}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
                          <div className={`h-1.5 rounded-full transition-all duration-1000 ${job.match >= 80 ? 'bg-green-400' : job.match >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${job.match}%` }}></div>
                        </div>
                        {/* ภาษาที่ต้องการ */}
                        <div className="flex flex-wrap gap-1">
                          {job.req.map((reqSkill, i) => (
                            <span key={i} className="text-[9px] border border-gray-700 bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{reqSkill}</span>
                          ))}
                        </div>
                      </div>

                      {/* Footer ของการ์ด (เงินเดือน + เวลา) */}
                      <div className="flex justify-between items-end pt-3 border-t border-gray-800/80 mt-auto">
                        <div>
                          <p className="text-[9px] text-gray-500 mb-0.5">เงินเดือน</p>
                          <p className="text-xs font-bold text-white">{job.pay}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[9px] text-gray-500">{job.time}</span>
                        </div>
                      </div>

                      {/* Hover Apply Button Overlay */}
                      <div className="absolute inset-0 bg-[#090d14]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center border border-blue-500/50 z-20">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-transform transform hover:scale-105">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          1-Click Apply
                        </button>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          )}

        </main>

        {/* ================= Request Endorsement Modal ================= */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
                <h3 className="font-bold text-white">Request Endorsement</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-5">

                {/* 1. เลือกสกิล */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Which skill?</label>
                  <select
                    className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    value={requestForm.skill}
                    onChange={(e) => setRequestForm({ ...requestForm, skill: e.target.value })}
                  >
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="Algorithms">Algorithms</option>
                  </select>
                </div>

                {/* 2. ส่งหาใคร */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Who to ask?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">@</span>
                    <input
                      type="text"
                      placeholder="GitHub Username or Email"
                      className="w-full bg-[#090d14] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipient}
                      onChange={(e) => setRequestForm({ ...requestForm, recipient: e.target.value })}
                    />
                  </div>
                </div>

                {/* 3. ข้อความ */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Message</label>
                  <textarea
                    rows={3}
                    placeholder="Hi! Could you endorse my React skill from our recent web project together?"
                    className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  ></textarea>
                </div>

                {/* ปุ่ม Submit */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert(`Sent endorsement request to ${requestForm.recipient || "your connection"} for ${requestForm.skill}!`);
                      setIsRequestModalOpen(false);
                      setRequestForm({ skill: "React", recipient: "", message: "" });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    Send Request 🚀
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}


      </div>
      {/* 👉 แปะหน้า CV ไว้ตรงนี้นอกสุด (ซ่อนในโหมดหน้าจอปกติ, โชว์เฉพาะตอน Print) */}
      <CVTemplate />
    </>
  );

}
