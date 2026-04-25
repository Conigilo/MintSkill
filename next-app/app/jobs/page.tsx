"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { skillsService } from "@/lib/services/skills.service";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

// Match calculation helper
function calcMatch(userSkills: string[], job: any) {
  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

  const matched = job.requiredSkills.filter((s) =>
    normalizedUserSkills.includes(s.toLowerCase())
  );
  const matchedPreferred = (job.preferredSkills || []).filter((s) =>
    normalizedUserSkills.includes(s.toLowerCase())
  );

  // Required = 80% weight, Preferred = 20% weight
  const reqScore = job.requiredSkills.length > 0 ? (matched.length / job.requiredSkills.length) * 80 : 0;
  const prefScore = (job.preferredSkills || []).length > 0 ? (matchedPreferred.length / job.preferredSkills!.length) * 20 : 0;
  const score = Math.round(reqScore + prefScore);

  return { score, matched, matchedPreferred, missing: job.requiredSkills.filter((s) => !normalizedUserSkills.includes(s.toLowerCase())) };
}

// Sub-component: Match ring
function MatchRing({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : "#94a3b8"; // Emerald for high, Slate for others
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 60 60" className="shrink-0">
        <circle cx="30" cy="30" r={radius} stroke="#f1f5f9" strokeWidth="3" fill="none" />
        <circle
          cx="30" cy="30" r={radius}
          stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="30" y="36" textAnchor="middle" fill={color} fontSize="14" fontWeight="800">{score}%</text>
      </svg>
      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-1">Match</span>
    </div>
  );
}

// Main Page
export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch user skills & jobs
  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      setLoading(true);
      try {
        // 1. Get skills
        let currentSkills: string[] = [];
        if (user) {
          const skillsData = await skillsService.getMySkills();
          if (skillsData) {
            currentSkills = skillsData.map((s: any) => s.name);
            setUserSkills(currentSkills);
          }
        }

        // 2. Get jobs from API
        // If logged in, get recommendations, otherwise get all
        const endpoint = user ? "/jobs/recommendations" : "/jobs";
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          headers: user ? { 'Authorization': `Bearer ${await user.getIdToken()}` } : {}
        });
        const jobsData = await response.json();
        console.log("DEBUG: Jobs from API:", jobsData);

        if (jobsData && Array.isArray(jobsData.data)) {
          setJobs(jobsData.data);
        } else if (Array.isArray(jobsData)) {
          // Fallback if API changes to direct array
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
      <div className="text-slate-900 h-screen flex flex-col bg-slate-50/50 overflow-hidden">

        {/*  Fixed Header Section */}
        <div className="px-10 pt-10 pb-6 shrink-0 bg-white/50 backdrop-blur-md border-b border-slate-100 z-20">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Opportunities</h1>
          <p className="text-slate-400 text-sm mt-1 mb-6">Discover roles that match your verified skill set.</p>

          {/* Filters moved here to be sticky */}
          <div className="flex gap-3">
            {([
              { key: "all", label: `All Jobs (${enrichedJobs.length})` },
              { key: "high", label: `Best Match` },
              { key: "medium", label: `Potential` },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${filter === f.key
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 📜 Scrollable Content Area */}
        <div className="flex flex-1 overflow-hidden px-10 gap-8 pt-6">

          {/* ── Left: Job List (Scrollable) ── */}
          <div className="flex-1 overflow-y-auto pb-10 space-y-4 no-scrollbar">

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest">Searching opportunities...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <p className="text-sm font-bold uppercase tracking-widest">No jobs found matching your criteria</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const { score, matched, missing } = job.match;
                const isSelected = selectedJobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(isSelected ? null : job.id)}
                    className={`relative bg-white border rounded-[1.5rem] p-6 cursor-pointer transition-all duration-300 ${isSelected
                      ? "border-emerald-600 shadow-2xl shadow-emerald-100 ring-1 ring-emerald-600/20"
                      : "border-slate-200/60 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100"
                      }`}
                  >
                    {/* Top Row: Logo & Company */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">
                        {job.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-500 truncate">{job.company}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{job.location}</p>
                      </div>
                      <div className="ml-auto">
                        <MatchRing score={score} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4 group-hover:text-emerald-600 transition-colors">
                      {job.title}
                    </h3>

                    {/* Meta Tags (Like JobThai) */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider border border-emerald-100">
                        {job.type}
                      </span>
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 font-bold border border-slate-100">
                        {job.salary}
                      </span>
                    </div>

                    {/* Skills Matching Section */}
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Required Skills Match</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((s) => {
                          const has = userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <span
                              key={s}
                              className={`text-[10px] px-2.5 py-1 rounded-md border font-bold transition-colors ${has
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                : "bg-slate-50 border-slate-100 text-slate-300"
                                }`}
                            >
                              {has ? "✓" : "✗"} {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Right: Job Detail Panel ── */}
          <div
            className={`bg-white h-full transition-all duration-500 overflow-y-auto no-scrollbar ${selectedJob ? "w-[420px] shrink-0 px-8 py-8 border-l border-slate-100 shadow-2xl" : "w-0 overflow-hidden px-0"
              }`}
          >
            {selectedJob && (() => {
              const { score, matched, matchedPreferred, missing } = selectedJob.match;
              const matchLabel = score >= 75 ? "Excellent Match" : score >= 40 ? "Potential Role" : "Skill Gap Identified";
              const matchColor = score >= 75 ? "text-indigo-600" : "text-slate-400";
              return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Title */}
                  <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl mb-4">
                      {selectedJob.logo}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedJob.title}</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-2">{selectedJob.company} <span className="mx-1 text-slate-300">•</span> {selectedJob.location}</p>
                  </div>

                  {/* Match Score Summary */}
                  <div className="text-center py-4">
                    <div className="inline-flex flex-col items-center">
                      <MatchRing score={score} />
                      <p className={`text-lg font-bold mt-3 ${matchColor}`}>{matchLabel}</p>
                    </div>
                  </div>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Contract", value: selectedJob.type },
                      { label: "Compensation", value: selectedJob.salary },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-50/50 rounded-2xl p-4">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                        <p className="text-xs text-slate-900 font-bold">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Core Competencies</p>
                      <div className="space-y-2">
                        {selectedJob.requiredSkills.map((s) => {
                          const has = userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <div key={s} className="flex items-center justify-between group">
                              <span className={`text-sm font-medium ${has ? "text-slate-900" : "text-slate-300"}`}>{s}</span>
                              {has ? (
                                <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-200 font-bold uppercase">Missing</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">About the Role</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedJob.description}</p>
                  </div>

                  {/* Apply CTA */}
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98]">
                    Submit Application
                  </button>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </SidebarLayout>
  );
}