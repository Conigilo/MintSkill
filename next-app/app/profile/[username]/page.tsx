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
      <div className="min-h-screen bg-[#0d1117] flex justify-center items-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center items-center text-white">
        <p className="text-xl mb-4">Profile not found</p>
        <button onClick={() => router.push("/explore")} className="text-blue-500 hover:underline">
          Back to Explore
        </button>
      </div>
    );
  }

  const p = portfolio.profile || {};
  const skills: any[] = portfolio.skills || [];
  const badges: any[] = portfolio.badges || [];
  const endorsements: any[] = portfolio.endorsements || [];
  const repos: any[] = portfolio.repositories || [];
  const verifiedSkills = skills.filter((s: any) => s.verified);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-16">
      {/* Simple Navigation */}
      <nav className="border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.push("/explore")}
            className="text-[#8b949e] hover:text-white text-sm flex items-center gap-2"
          >
            &larr; Back to Explore
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full md:w-[296px] flex flex-col items-center md:items-start shrink-0">
            <div className="w-64 h-64 md:w-[296px] md:h-[296px] rounded-full overflow-hidden border border-[#30363d] mb-4 bg-[#161b22]">
              {p.avatarUrl || p.photoURL ? (
                <img src={p.avatarUrl || p.photoURL} alt={p.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-[#8b949e]">
                  {(p.displayName || p.username || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-semibold text-[#c9d1d9]">{p.displayName || "Developer"}</h1>
            <p className="text-xl font-light text-[#8b949e] mb-4">{p.username || username}</p>

            {p.bio && <p className="text-sm text-[#c9d1d9] mb-4 text-center md:text-left leading-relaxed">{p.bio}</p>}

            {(!user || user.uid !== p.id) && (
              <button
                onClick={() => setEndorseOpen(true)}
                className="w-full bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-sm font-medium py-1.5 px-3 rounded-md border border-[#f0f6fc1a] transition-colors mb-4"
              >
                Endorse
              </button>
            )}

            <div className="w-full text-sm text-[#8b949e] space-y-1.5">
              {p.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 00-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z" /></svg>
                  {p.location}
                </div>
              )}
              {p.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.983 15V6.368H1.144V15h2.839ZM2.569 5.187A1.642 1.642 0 1 1 2.56 1.9a1.642 1.642 0 0 1 .01 3.287ZM14.856 15h-2.835V10.8c0-1.002-.02-2.29-1.396-2.29-1.396 0-1.61 1.09-1.61 2.215V15H6.18V6.368h2.72v1.18h.039c.379-.718 1.305-1.472 2.68-1.472 2.87 0 3.4 1.89 3.4 4.348V15h-.163Z" /></svg>
                  <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full flex-1 space-y-8 mt-2 md:mt-0">
            
            {/* Nav Tabs (Static visual only for aesthetics) */}
            <div className="border-b border-[#30363d] flex gap-4">
              <div className="border-b-2 border-[#f78166] text-[#c9d1d9] pb-2 text-sm font-medium px-2">Overview</div>
              {repos.length > 0 && <div className="text-[#8b949e] pb-2 text-sm px-2">Repositories <span className="bg-[#1f2428] text-xs px-2 py-0.5 rounded-full ml-1">{repos.length}</span></div>}
              {skills.length > 0 && <div className="text-[#8b949e] pb-2 text-sm px-2">Skills <span className="bg-[#1f2428] text-xs px-2 py-0.5 rounded-full ml-1">{skills.length}</span></div>}
            </div>

            {/* Overview Stats Outline */}
            {skills.length > 0 && (
              <div className="border border-[#30363d] rounded-md p-4">
                <div className="text-xs text-[#8b949e] uppercase mb-4 font-semibold">Stats</div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-medium text-[#c9d1d9]">{skills.length}</div>
                    <div className="text-xs text-[#8b949e] mt-1">Skills</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-[#c9d1d9]">{verifiedSkills.length}</div>
                    <div className="text-xs text-[#8b949e] mt-1">Verified</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-[#c9d1d9]">{badges.length}</div>
                    <div className="text-xs text-[#8b949e] mt-1">Badges</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-[#c9d1d9]">{endorsements.length}</div>
                    <div className="text-xs text-[#8b949e] mt-1">Endorsements</div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-base font-medium text-[#c9d1d9] mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, i: number) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        skill.verified
                          ? "border-[#238636] text-[#3fb950] bg-[#238636]/10"
                          : "border-[#30363d] text-[#8b949e] bg-[#21262d]"
                      }`}
                    >
                      {skill.name} {skill.verified && <span className="ml-1">✓</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <h2 className="text-base font-medium text-[#c9d1d9] mb-3">Badges</h2>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  {badges.map((badge: any, i: number) => (
                    <div key={i} className="flex flex-row items-center gap-3 border border-[#30363d] rounded-md p-3 min-w-[250px] bg-[#0d1117]">
                      <img src={badge.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"} className="w-8 h-8 object-contain" alt="" />
                      <div>
                        <div className="font-semibold text-sm text-[#c9d1d9]">{badge.name}</div>
                        <div className="text-xs text-[#8b949e]">{badge.skillName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Endorsements */}
            {endorsements.length > 0 && (
              <div>
                <h2 className="text-base font-medium text-[#c9d1d9] mb-3">Endorsements</h2>
                <div className="space-y-4 border-l-2 border-[#21262d] pl-4">
                  {endorsements.slice(0, 5).map((e: any, i: number) => (
                    <div key={i} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm text-[#c9d1d9]">{e.fromName || "Anonymous"}</div>
                        {e.fromRole && <div className="text-xs text-[#8b949e] before:content-['•'] before:mr-2">{e.fromRole}</div>}
                      </div>
                      {e.message && <p className="text-sm text-[#8b949e] mb-2 font-serif italic text-balance">"{e.message}"</p>}
                      {e.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {e.skills.map((s: string, j: number) => (
                            <span key={j} className="text-xs text-[#8b949e] bg-[#21262d] rounded-md px-1.5 py-0.5">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repositories */}
            {repos.length > 0 && (
              <div>
                <h2 className="text-base font-medium text-[#c9d1d9] mb-3">Pinned</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {repos.slice(0, 6).map((repo: any, i: number) => (
                    <a key={i} href={repo.url} target="_blank" rel="noreferrer" className="block border border-[#30363d] rounded-md p-4 bg-[#0d1117] hover:border-[#8b949e] transition-colors">
                      <div className="flex items-center gap-2 font-semibold text-sm text-[#58a6ff] mb-2 hover:underline">
                        <svg className="w-4 h-4 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" /></svg>
                        {repo.name}
                      </div>
                      {repo.description && <p className="text-xs text-[#8b949e] mb-4 h-8 line-clamp-2">{repo.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                        {repo.language && <span>{repo.language}</span>}
                        {repo.stars > 0 && <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>{repo.stars}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Endorse Modal */}
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
    </div>
  );
}
