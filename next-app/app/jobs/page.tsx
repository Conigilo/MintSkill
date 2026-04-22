"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { skillsService } from "@/lib/services/skills.service";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import MOCK_JOBS from "./mock";

// Match calculation helper
function calcMatch(userSkills: string[], job: typeof MOCK_JOBS[0]) {
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
  const color = score >= 80 ? "#22c55e" : score >= 55 ? "#eab308" : "#f97316";
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="shrink-0">
      <circle cx="30" cy="30" r={radius} stroke="#1f2937" strokeWidth="5" fill="none" />
      <circle
        cx="30" cy="30" r={radius}
        stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="30" y="35" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold">{score}%</text>
    </svg>
  );
}

// Main Page
export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch user skills on mount
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setSkillsLoading(false); return; }
    skillsService.getMySkills()
      .then((data) => {
        if (data) setUserSkills(data.map((s: any) => s.name));
      })
      .finally(() => setSkillsLoading(false));
  }, [user, authLoading]);

  // Enrich mock jobs with match data
  const enrichedJobs = useMemo(() =>
    MOCK_JOBS.map((job) => ({ ...job, match: calcMatch(userSkills, job) }))
      .sort((a, b) => b.match.score - a.match.score),
    [userSkills]
  );

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
      <div className="text-slate-900 min-h-screen">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Job Matching</h1>

        </div>

        <div className="flex h-full">

          {/* ── Left: Job List ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ maxHeight: "calc(100vh - 130px)" }}>

            {/* Filters */}
            <div className="flex gap-2 mb-2">
              {([
                { key: "all", label: `ทั้งหมด (${enrichedJobs.length})` },
                { key: "high", label: `🟢 High Match (${enrichedJobs.filter((j) => j.match.score >= 75).length})` },
                { key: "medium", label: `🟡 Medium (${enrichedJobs.filter((j) => j.match.score >= 40 && j.match.score < 75).length})` },
                { key: "low", label: `🔴 Low (${enrichedJobs.filter((j) => j.match.score < 40).length})` },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${filter === f.key
                    ? "bg-blue-600 border-blue-500 text-slate-900"
                    : "bg-transparent border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Job Cards */}
            {filteredJobs.map((job) => {
              const { score, matched, missing } = job.match;
              const isSelected = selectedJobId === job.id;
              const matchColor = score >= 75 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-orange-400";
              const matchBorder = score >= 75 ? "border-green-500/25 hover:border-green-500/50" : score >= 40 ? "border-yellow-500/15 hover:border-yellow-500/40" : "border-slate-200 hover:border-slate-300";

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(isSelected ? null : job.id)}
                  className={`relative bg-white border rounded-2xl p-5 cursor-pointer transition-all ${matchBorder} ${isSelected ? "ring-1 ring-blue-500/50" : ""}`}
                >
                  <div className="flex items-start gap-4">

                    {/* Logo */}
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                      {job.logo}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">{job.title}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{job.company} · {job.location}</p>
                        </div>
                        <MatchRing score={score} />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-[10px] px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-500 font-semibold uppercase">{job.type}</span>
                        <span className="text-[10px] px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-500">{job.salary}</span>
                      </div>

                      {/* Skills quick view */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requiredSkills.map((s) => {
                          const has = userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <span
                              key={s}
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${has
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                : "bg-red-500/5 border-red-500/15 text-red-400"
                                }`}
                            >
                              {has ? "✓" : "✗"} {s}
                            </span>
                          );
                        })}
                      </div>

                      {/* Match summary line */}
                      <p className={`text-xs mt-3 font-semibold ${matchColor}`}>
                        {score >= 75 ? "🟢 High Match" : score >= 40 ? "🟡 Medium Match" : "🔴 Low Match"} —{" "}
                        {matched.length}/{job.requiredSkills.length} required skills matched
                        {missing.length > 0 && `, ขาด: ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? ` +${missing.length - 2}` : ""}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right: Job Detail Panel ── */}
          <div
            className={`border-l border-slate-200 bg-slate-50 transition-all duration-300 overflow-y-auto ${selectedJob ? "w-[380px] shrink-0 px-6 py-6" : "w-0 overflow-hidden px-0"
              }`}
            style={{ maxHeight: "calc(100vh - 130px)" }}
          >
            {selectedJob && (() => {
              const { score, matched, matchedPreferred, missing } = selectedJob.match;
              const matchLabel = score >= 75 ? "High Match ✅" : score >= 40 ? "Medium Match 🟡" : "Low Match 🔴";
              const matchColor = score >= 75 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-orange-400";
              return (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                      {selectedJob.logo}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
                      <p className="text-sm text-slate-500">{selectedJob.company}</p>
                    </div>
                  </div>

                  {/* Match Score Big */}
                  <div className={`bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5`}>
                    <MatchRing score={score} />
                    <div>
                      <p className={`text-xl font-black ${matchColor}`}>{matchLabel}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {matched.length}/{selectedJob.requiredSkills.length} required · {matchedPreferred.length}/{(selectedJob.preferredSkills || []).length} preferred
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Location", value: selectedJob.location },
                      { label: "Type", value: selectedJob.type },
                      { label: "Salary", value: selectedJob.salary },
                    ].map((m) => (
                      <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</p>
                        <p className="text-sm text-slate-900 font-semibold mt-1">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Required Skills */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Required Skills</p>
                    <div className="space-y-2">
                      {selectedJob.requiredSkills.map((s) => {
                        const has = userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase());
                        return (
                          <div key={s} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${has ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/15"}`}>
                            <span className={`text-sm font-medium ${has ? "text-emerald-300" : "text-red-400"}`}>{s}</span>
                            {has
                              ? <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">✓ มีแล้ว</span>
                              : <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">✗ ยังไม่มี</span>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  {selectedJob.preferredSkills && selectedJob.preferredSkills.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Preferred Skills <span className="text-gray-700">(bonus)</span></p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.preferredSkills.map((s) => {
                          const has = userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <span key={s} className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${has ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                              {has ? "✓ " : ""}{s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills Advice */}
                  {missing.length > 0 && (
                    <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
                      <p className="text-xs font-bold text-yellow-400 mb-2">💡 สกิลที่ควรเพิ่มเพื่อให้ได้งานนี้</p>
                      <div className="flex flex-wrap gap-1.5">
                        {missing.map((s) => (
                          <span key={s} className="text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-2 py-1 rounded-md font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply CTA */}
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30">
                    สมัครงานนี้ →
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