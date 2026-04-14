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
      .then((data) => {
        if (data) {
          setPortfolio(data);
        } else {
          setError("User not found");
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#090d14] flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="min-h-screen bg-[#090d14] flex flex-col items-center justify-center text-white gap-4">
        <p className="text-4xl">😕</p>
        <p className="text-gray-400">{error || "Something went wrong"}</p>
        <button onClick={() => router.push("/explore")} className="text-blue-400 hover:underline text-sm">
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
    <main className="min-h-screen bg-[#090d14] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/explore")} className="text-gray-400 hover:text-white transition text-sm">
            ← Explore
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 font-medium">{p.displayName || p.username}</span>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Profile Card */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Avatar + Info */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-64 shrink-0">
            {p.avatarUrl || p.photoURL ? (
              <img
                src={p.avatarUrl || p.photoURL}
                alt={p.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-800"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold border-4 border-gray-800">
                {(p.displayName || "U")[0]}
              </div>
            )}

            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{p.displayName || "Developer"}</h1>
              <p className="text-gray-400 text-sm">@{p.username || username}</p>
              {p.title && <p className="text-blue-400 text-sm mt-1">{p.title}</p>}
              {p.bio && <p className="text-gray-400 text-xs mt-2 leading-relaxed">{p.bio}</p>}
              {p.location && (
                <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                  📍 {p.location}
                </p>
              )}
            </div>

            {/* Endorse button */}
            {user && user.uid !== p.id && (
              <button
                onClick={() => setEndorseOpen(true)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-900/40"
              >
                ✦ Endorse This Developer
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "SKILLS", value: skills.length, color: "text-blue-400" },
                { label: "VERIFIED", value: verifiedSkills.length, color: "text-green-400" },
                { label: "BADGES", value: badges.length, color: "text-yellow-400" },
                { label: "ENDORSEMENTS", value: endorsements.length, color: "text-purple-400" },
              ].map((s, i) => (
                <div key={i} className="bg-[#161b22] border border-gray-800 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, i: number) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        skill.verified
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-[#0d1117] border-gray-700 text-gray-400"
                      }`}
                    >
                      {skill.verified && "✓ "}{skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Earned Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((badge: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => setBadgeModal(badge)}
                      className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-center hover:border-blue-500/50 hover:bg-[#161b22] transition-all cursor-pointer"
                    >
                      <img
                        src={badge.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"}
                        className="w-8 h-8 mx-auto mb-2 object-contain"
                        alt=""
                      />
                      <h4 className="text-xs font-semibold text-white">{badge.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{badge.skillName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Endorsements */}
        {endorsements.length > 0 && (
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
              Endorsements ({endorsements.length})
            </h3>
            <div className="space-y-4">
              {endorsements.slice(0, 6).map((e: any, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-[#0d1117] border border-gray-800 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                    {(e.fromName || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">{e.fromName || "Anonymous"}</span>
                      {e.fromRole && <span className="text-xs text-gray-500">— {e.fromRole}</span>}
                    </div>
                    {e.message && <p className="text-xs text-gray-400 mt-1 line-clamp-2">"{e.message}"</p>}
                    {e.skills?.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {e.skills.map((s: string, j: number) => (
                          <span key={j} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Repos */}
        {repos.length > 0 && (
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
              Repositories ({repos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {repos.slice(0, 6).map((repo: any, i: number) => (
                <a
                  key={i}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors block"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-blue-400">{repo.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {repo.stars > 0 && <span>⭐ {repo.stars}</span>}
                      {repo.forks > 0 && <span>🍴 {repo.forks}</span>}
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{repo.description}</p>
                  )}
                  {repo.language && (
                    <span className="inline-block text-[10px] bg-gray-800 px-2 py-0.5 rounded mt-2 text-gray-400">
                      {repo.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badge Modal */}
      {badgeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setBadgeModal(null)}
        >
          <div
            className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-gray-800">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skill Certificate</span>
              <button onClick={() => setBadgeModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all">
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-lg relative mb-4">
                <img src={badgeModal.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"} className="w-10 h-10 object-contain" alt="" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-[#0d1117] w-6 h-6 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{badgeModal.name}</h3>
              <p className="text-blue-400 text-sm font-medium mt-1">Verified Expert</p>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <div className="bg-[#090d14] rounded-2xl p-4 border border-gray-800 space-y-3 text-left">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Verification</p>
                  <p className="text-sm text-green-400 font-medium">{badgeModal.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Issued: {new Date(badgeModal.unlockedAt?.seconds ? badgeModal.unlockedAt.seconds * 1000 : badgeModal.unlockedAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Earned by</p>
                  <p className="text-xs text-gray-400">{p.displayName || p.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endorse Modal */}
      {endorseOpen && (
        <EndorseModal
          targetUserId={p.id}
          targetName={p.displayName || p.username || "Developer"}
          onClose={() => setEndorseOpen(false)}
          onSuccess={() => {
            setEndorseOpen(false);
            // Refresh data
            developersService.getDeveloperPortfolio(username).then((data) => {
              if (data) setPortfolio(data);
            });
          }}
        />
      )}
    </main>
  );
}
