"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { skillsService } from "@/lib/services/skills.service";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

// Match calculation helper
function calcMatch(userSkills: any[], job: any) {
  const calculateProficiency = (skillName: string): { proficiency: number; has: boolean; detail?: any } => {
    const userSkill = userSkills.find(
      (us) => us.name.toLowerCase() === skillName.toLowerCase()
    );
    if (!userSkill) return { proficiency: 0, has: false }; // ไม่มีทักษะนี้เลย

    const quiz = userSkill.quizScore || 0;
    const endo = userSkill.endorsementScore || (userSkill.endorsements ? Math.min(userSkill.endorsements * 20, 100) : 0);

    let proficiency = 30; // คะแนนฐาน 30% ถ้าแอดไว้แต่ไม่มีคะแนน
    if (quiz > 0 || endo > 0) {
      proficiency = (quiz * 0.5) + (endo * 0.5);
    } else if (userSkill.level) {
      proficiency = userSkill.level * 10;
    }

    return {
      proficiency: Math.min(100, Math.max(0, proficiency)),
      has: true,
      detail: userSkill
    };
  };

  // คำนวณความเข้ากันได้ของ Required Skills (น้ำหนัก 80%)
  let reqTotalProficiency = 0;
  const matchedRequired: string[] = [];
  const lowProficiencyRequired: string[] = [];
  const missingRequired: string[] = [];

  job.requiredSkills.forEach((s: string) => {
    const result = calculateProficiency(s);
    if (result.has) {
      reqTotalProficiency += result.proficiency / 100; // คิดเป็นสัดส่วน 0.0 - 1.0
      if (result.proficiency >= 50) {
        matchedRequired.push(s);
      } else {
        lowProficiencyRequired.push(s);
      }
    } else {
      missingRequired.push(s);
    }
  });

  // คำนวณความเข้ากันได้ของ Preferred Skills (น้ำหนัก 20%)
  let prefTotalProficiency = 0;
  const matchedPreferred: string[] = [];
  const preferred = job.preferredSkills || [];

  preferred.forEach((s: string) => {
    const result = calculateProficiency(s);
    if (result.has) {
      prefTotalProficiency += result.proficiency / 100;
      matchedPreferred.push(s);
    }
  });

  const reqScore = job.requiredSkills.length > 0 ? (reqTotalProficiency / job.requiredSkills.length) * 80 : 0;
  const prefScore = preferred.length > 0 ? (prefTotalProficiency / preferred.length) * 20 : 0;
  const score = Math.round(reqScore + prefScore);

  return {
    score,
    matchedRequired,
    lowProficiencyRequired,
    missingRequired,
    matchedPreferred,
    calculateProficiency
  };
}

// Sub-component: Match ring
function MatchRing({ score }: { score: number }) {
  const color = score >= 75 ? "#059669" : "#64748b"; // Clean Emerald for high, Slate for others
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 60 60" className="shrink-0">
        <circle cx="30" cy="30" r={radius} stroke="#e2e8f0" strokeWidth="2.5" fill="none" className="dark:stroke-[#21262d]" />
        <circle
          cx="30" cy="30" r={radius}
          stroke={color} strokeWidth="2.5" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="30" y="35" textAnchor="middle" fill={color} fontSize="13" fontWeight="600">{score}%</text>
      </svg>
      <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Match</span>
    </div>
  );
}

// Main Page
export default function JobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // Fetch user skills & jobs
  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      setLoading(true);
      try {
        // 1. Get skills
        if (user) {
          const skillsData = await skillsService.getMySkills();
          if (skillsData) {
            setUserSkills(skillsData);
          }
        }

        // 2. Get jobs from API
        const endpoint = user ? "/jobs/recommendations" : "/jobs";
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          headers: user ? { 'Authorization': `Bearer ${await user.getIdToken()}` } : {}
        });
        const jobsData = await response.json();
        console.log("DEBUG: Jobs from API:", jobsData);

        if (jobsData && Array.isArray(jobsData.data)) {
          setJobs(jobsData.data);
        } else if (Array.isArray(jobsData)) {
          setJobs(jobsData);
        } else {
          console.warn("API did not return an array of jobs in .data:", jobsData);
          setJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  // Handle Application
  const handleApply = async (jobId: string) => {
    if (!user) {
      alert("Please login to apply for this job.");
      return;
    }

    setApplying(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: "Interested in this position based on my verified skills."
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully applied for ${selectedJob?.title}!`);
      } else {
        alert(`Failed to apply: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Apply Error:", error);
      alert("An error occurred while submitting your application.");
    } finally {
      setApplying(false);
    }
  };

  // Enrich jobs with match data
  const enrichedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs.map((job) => ({ ...job, match: calcMatch(userSkills, job) }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [userSkills, jobs]);

  // Filter
  const filteredJobs = useMemo(() => {
    if (filter === "high") return enrichedJobs.filter((j) => j.match.score >= 75);
    if (filter === "medium") return enrichedJobs.filter((j) => j.match.score >= 40 && j.match.score < 75);
    if (filter === "low") return enrichedJobs.filter((j) => j.match.score < 40);
    return enrichedJobs;
  }, [enrichedJobs, filter]);

  const selectedJob = enrichedJobs.find((j) => j.id === selectedJobId);

  return (
    <SidebarLayout activePage="jobs">
      <div className="text-slate-900 dark:text-[#f0f6fc] h-screen flex flex-col bg-slate-50 dark:bg-[#0d1117] overflow-hidden">

        {/* Fixed Header Section */}
        <div className="px-10 pt-8 pb-5 shrink-0 bg-white dark:bg-[#161b22] border-b border-slate-100 dark:border-[#21262d] z-20">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Job Opportunities ({enrichedJobs.length} positions)
          </h1>
          <p className="text-slate-500 dark:text-[#8b949e] text-xs mt-1 mb-5">Discover roles that match your verified skill set.</p>

          {/* Filters */}
          <div className="flex gap-2">
            {([
              { key: "all", label: `All Jobs` },
              { key: "high", label: `Best Match` },
              { key: "medium", label: `Potential` },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${filter === f.key
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                  : "bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-[#8b949e] hover:bg-slate-200 dark:hover:bg-[#161b22]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Grid Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 no-scrollbar">

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold uppercase tracking-wider">Searching opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <p className="text-xs font-semibold uppercase tracking-wider">No jobs found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredJobs.map((job) => {
                const { score, calculateProficiency } = job.match;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-[#30363d] rounded-2xl p-5 hover:border-slate-300 dark:hover:border-[#484f58] transition-all hover:shadow-sm cursor-pointer relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Info: Logo, Company & Match Ring */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex gap-2.5 min-w-0">
                          <div className="w-9 h-9 shrink-0 rounded bg-slate-100 dark:bg-[#21262d] flex items-center justify-center text-xl">
                            {job.logo}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600 dark:text-[#8b949e] truncate leading-tight">{job.company}</p>
                            <p className="text-[11px] text-slate-400 dark:text-[#8b949e]/60 mt-1">{job.location}</p>
                          </div>
                        </div>
                        <div className="shrink-0 scale-90">
                          <MatchRing score={score} />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight mb-3 line-clamp-2 min-h-[40px] leading-snug">
                        {job.title}
                      </h3>
                    </div>

                    {/* Bottom section: Tags & Skill status */}
                    <div className="space-y-3.5 mt-auto pt-3.5 border-t border-slate-100 dark:border-[#21262d]">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20 font-semibold uppercase tracking-wider">
                          {job.type}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-[#8b949e] border border-slate-100/50 dark:border-transparent font-medium">
                          {job.salary}
                        </span>
                      </div>

                      {/* Skills Dot Indicators */}
                      <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                        {job.requiredSkills.slice(0, 3).map((s: string) => {
                          const result = calculateProficiency(s);
                          return (
                            <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#8b949e]">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                result.has
                                  ? result.proficiency >= 50
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`} />
                              {s}
                            </span>
                          );
                        })}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-[10px] text-slate-400 dark:text-[#8b949e]/60 font-medium">
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Slide-out Drawer */}
        {selectedJob && (() => {
          const { score, calculateProficiency } = selectedJob.match;
          const matchLabel = score >= 75 ? "Excellent Match" : score >= 40 ? "Potential Role" : "Skill Gap Identified";
          const matchColor = score >= 75 ? "text-emerald-700 dark:text-emerald-400" : score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
          
          // Check if user has any gaps (missing skills or skills with proficiency < 50)
          const hasGaps = selectedJob.requiredSkills.some((s: string) => {
            const result = calculateProficiency(s);
            return !result.has || result.proficiency < 50;
          });

          return (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop overlay */}
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => setSelectedJobId(null)}
              />
              
              {/* Drawer Panel */}
              <div className="relative w-full sm:w-[480px] h-full bg-white dark:bg-[#0d1117] shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#21262d] z-50 animate-in slide-in-from-right duration-300">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#21262d]">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Job Details</span>
                  <button 
                    onClick={() => setSelectedJobId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                  {/* Logo & Company info */}
                  <div className="flex items-start gap-4 pb-5 border-b border-slate-100 dark:border-[#21262d]">
                    <div className="w-12 h-12 rounded bg-slate-100 dark:bg-[#161b22] border border-transparent dark:border-[#30363d] flex items-center justify-center text-2xl shrink-0">
                      {selectedJob.logo}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">{selectedJob.title}</h2>
                      <p className="text-xs font-medium text-slate-500 dark:text-[#8b949e] mt-1">{selectedJob.company} • {selectedJob.location}</p>
                    </div>
                  </div>

                  {/* Match Analysis Box */}
                  <div className="flex items-center justify-between bg-slate-50/50 dark:bg-[#161b22]/40 rounded-xl p-4 border border-slate-100 dark:border-[#21262d]">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Analysis</p>
                      <p className={`text-sm font-semibold mt-1 ${matchColor}`}>{matchLabel}</p>
                      <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">{score}% of skills requirements met</p>
                    </div>
                    <div className="shrink-0 scale-90">
                      <MatchRing score={score} />
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/30 dark:bg-[#161b22]/20 border border-slate-100 dark:border-[#21262d]/60 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Contract Type</p>
                      <p className="text-xs text-slate-700 dark:text-[#f0f6fc] font-semibold mt-0.5">{selectedJob.type}</p>
                    </div>
                    <div className="bg-slate-50/30 dark:bg-[#161b22]/20 border border-slate-100 dark:border-[#21262d]/60 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Compensation</p>
                      <p className="text-xs text-slate-700 dark:text-[#f0f6fc] font-semibold mt-0.5">{selectedJob.salary}</p>
                    </div>
                  </div>

                  {/* Core Competencies Comparison */}
                  <div className="space-y-3.5">
                    <p className="text-[10px] text-slate-500 dark:text-[#8b949e] font-semibold uppercase tracking-wider">Core Competencies</p>
                    
                    {/* Unified skills box */}
                    <div className="space-y-3.5 bg-slate-50/50 dark:bg-[#161b22]/40 border border-slate-100 dark:border-[#21262d] rounded-xl p-4">
                      {selectedJob.requiredSkills.map((s: string) => {
                        const result = calculateProficiency(s);
                        return (
                          <div key={s} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold ${result.has ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>{s}</span>
                              {result.has ? (
                                result.proficiency >= 50 ? (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-emerald-100/50 dark:border-emerald-500/20">
                                    ✓ {Math.round(result.proficiency)}%
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-100/50 dark:border-amber-500/20">
                                    ⚠ {Math.round(result.proficiency)}%
                                  </span>
                                )
                              ) : (
                                <span className="text-[9px] bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 px-2 py-0.5 rounded font-medium">Missing</span>
                              )}
                            </div>

                            {/* Thin clean progress bar (0.5px height) */}
                            {result.has && (
                              <div className="w-full bg-slate-200 dark:bg-[#21262d] h-0.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${result.proficiency >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${result.proficiency}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Unified Action Suggestion Card */}
                    {hasGaps && (
                      <div className="p-3.5 bg-slate-50/30 dark:bg-[#161b22]/20 border border-slate-150/60 dark:border-[#21262d]/50 rounded-xl space-y-2.5">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 text-xs mt-0.5">💡</span>
                          <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 dark:text-[#f0f6fc]">Improve Your Skills Match</h4>
                            <p className="text-[10px] text-slate-500 dark:text-[#8b949e] leading-relaxed">
                              You have missing or low-level skills for this position. Take a quiz or request endorsements to boost your score.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              localStorage.setItem('activeDashboardTab', 'Skills');
                              router.push('/dashboard');
                            }}
                            className="flex-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-[#8b949e] font-semibold py-1.5 px-2 rounded-lg transition-colors border border-slate-200/60 dark:border-[#30363d] flex items-center justify-center cursor-pointer"
                          >
                            สอบควิซพัฒนาสกิล
                          </button>
                          <button
                            onClick={() => {
                              localStorage.setItem('activeDashboardTab', 'Endorsements');
                              router.push('/dashboard');
                            }}
                            className="flex-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-[#8b949e] font-semibold py-1.5 px-2 rounded-lg transition-colors border border-slate-200/60 dark:border-[#30363d] flex items-center justify-center cursor-pointer"
                          >
                            ขอคำรับรอง
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* About the Role */}
                  <div className="pt-5 border-t border-slate-100 dark:border-[#21262d]">
                    <p className="text-[10px] text-slate-500 dark:text-[#8b949e] font-semibold uppercase tracking-wider mb-2">About the Role</p>
                    <p className="text-xs text-slate-600 dark:text-[#8b949e] leading-relaxed font-normal">{selectedJob.description}</p>
                  </div>
                </div>

                {/* Drawer Action Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-[#21262d] bg-slate-50/50 dark:bg-[#161b22]/20">
                  <button
                    onClick={() => handleApply(selectedJob.id)}
                    disabled={applying}
                    className={`w-full text-white dark:text-slate-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer ${applying ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100"
                      }`}
                  >
                    {applying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </SidebarLayout>
  );
}