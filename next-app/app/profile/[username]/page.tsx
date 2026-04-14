"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { developersService } from "@/lib/services/developers.service";
import { useAuth } from "@/lib/hooks/useAuth";
import EndorseModal from "@/components/EndorseModal";

export default function PublicProfilePage() {
  const { username } = useParams() as { username: string };
  const router = useRouter();
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [endorseOpen, setEndorseOpen] = useState(false);
  const [badgeModal, setBadgeModal] = useState<any>(null);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    developersService
      .getDeveloperPortfolio(username)
      .then((data) => { if (data) setPortfolio(data); else setError("User not found"); })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0d13] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">Loading profile...</p>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="min-h-screen bg-[#0a0d13] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-lg font-semibold text-white">Profile not found</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => router.push("/explore")} className="mt-2 text-sm text-blue-400 hover:text-blue-300 hover:underline transition">
          ← Back to Explore
        </button>
      </main>
    );
  }

  const p = portfolio.profile || {};
  const skills: any[] = portfolio.skills || [];
  const badges: any[] = portfolio.badges || [];
  const endorsements: any[] = portfolio.endorsements || [];
  const repos: any[] = portfolio.repositories || [];
  const verifiedSkills = skills.filter((s: any) => s.verified);

  return (
    <main className="min-h-screen bg-[#0a0d13] text-white pb-24">

      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[160px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0d13]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/explore")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Explore
          </button>
          <span className="text-xs text-gray-600 font-mono">Public Profile</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 space-y-8">

        {/* ── Profile Header ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

          {/* Avatar */}
          <div className="shrink-0">
            {p.avatarUrl || p.photoURL ? (
              <img
                src={p.avatarUrl || p.photoURL}
                alt={p.displayName}
                className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-bold border border-white/10 shadow-lg">
                {(p.displayName || p.username || "U")[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{p.displayName || "Developer"}</h1>
              {p.title && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {p.title}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">@{p.username || username}</p>

            {p.bio && <p className="text-sm text-gray-300 leading-relaxed mb-4 max-w-lg">{p.bio}</p>}

            <div className="flex flex-wrap items-center gap-4">
              {p.location && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {p.location}
                </span>
              )}
              {p.linkedinUrl && (
                <a href={p.linkedinUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Endorse Button */}
          {(!user || user.uid !== p.id) && (
            <div className="shrink-0 mt-1">
              <button
                onClick={() => setEndorseOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
              >
                ✦ Endorse
              </button>
            </div>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Skills", value: skills.length },
            { label: "Verified", value: verifiedSkills.length },
            { label: "Badges", value: badges.length },
            { label: "Endorsements", value: endorsements.length },
          ].map((s, i) => (
            <div key={i} className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any, i: number) => (
                <span
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium ${
                    skill.verified
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                      : "bg-[#161d2c] border-white/5 text-gray-400"
                  }`}
                >
                  {skill.verified && (
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {skill.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Badges ── */}
        {badges.length > 0 && (
          <Section title="Badges">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges.map((badge: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setBadgeModal(badge)}
                  className="flex items-center gap-3 bg-[#111827] border border-white/5 rounded-xl p-4 text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                >
                  <img
                    src={badge.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"}
                    className="w-9 h-9 object-contain shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{badge.name}</p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide mt-0.5">{badge.skillName}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* ── Endorsements ── */}
        {endorsements.length > 0 && (
          <Section title={`Endorsements (${endorsements.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endorsements.slice(0, 6).map((e: any, i: number) => (
                <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {(e.fromName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{e.fromName || "Anonymous"}</p>
                      {e.fromRole && <p className="text-xs text-gray-500">{e.fromRole}</p>}
                    </div>
                  </div>
                  {e.message && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-3 pl-12">"{e.message}"</p>
                  )}
                  {e.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-12">
                      {e.skills.map((s: string, j: number) => (
                        <span key={j} className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── GitHub Repos ── */}
        {repos.length > 0 && (
          <Section title="Repositories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repos.slice(0, 6).map((repo: any, i: number) => (
                <a
                  key={i}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#111827] border border-white/5 rounded-xl p-5 hover:border-white/10 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">{repo.name}</h4>
                    <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        {repo.language}
                      </span>
                    )}
                    {repo.stars > 0 && <span>⭐ {repo.stars}</span>}
                    {repo.forks > 0 && <span>🍴 {repo.forks}</span>}
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* ── Badge Detail Modal ── */}
      {badgeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setBadgeModal(null)}>
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Badge Detail</span>
              <button onClick={() => setBadgeModal(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all">✕</button>
            </div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#1c2333] rounded-2xl flex items-center justify-center border border-white/5">
                <img src={badgeModal.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"} className="w-12 h-12 object-contain" alt="" />
              </div>
              <h3 className="text-xl font-bold text-white">{badgeModal.name}</h3>
              <span className="inline-block mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Expert
              </span>
              {badgeModal.description && (
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">{badgeModal.description}</p>
              )}
              <p className="text-xs text-gray-600 mt-4">
                Issued: {new Date(badgeModal.unlockedAt?.seconds ? badgeModal.unlockedAt.seconds * 1000 : badgeModal.unlockedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Endorse Modal ── */}
      {endorseOpen && (
        <EndorseModal
          targetUserId={p.id}
          targetName={p.displayName || p.username || "Developer"}
          onClose={() => setEndorseOpen(false)}
          onSuccess={() => {
            setEndorseOpen(false);
            developersService.getDeveloperPortfolio(username).then((data) => { if (data) setPortfolio(data); });
          }}
        />
      )}
    </main>
  );
}

// ── Reusable Section Wrapper ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#0e1420]/60 border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h2>
      {children}
    </section>
  );
}
