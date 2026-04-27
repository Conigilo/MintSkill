"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { developersService } from "@/lib/services/developers.service";
import { useAuth } from "@/lib/hooks/useAuth";
import EndorseModal from "@/components/EndorseModal";
import { Share2, MapPin, Linkedin, Github, ExternalLink, Award, Code2, MessageSquare, ArrowLeft } from "lucide-react";

export default function PublicProfilePage() {
  const { username } = useParams() as { username: string };
  const router = useRouter();
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [endorseOpen, setEndorseOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    developersService
      .getDeveloperPortfolio(username)
      .then((data) => { if (data) setPortfolio(data); else setError("User not found"); })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Premium Portfolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-900 px-4 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
        <p className="text-slate-500 mb-8 max-w-md">We couldn't find the developer you're looking for. They might have changed their username or the link is incorrect.</p>
        <button 
          onClick={() => router.push("/explore")} 
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-xl transition-all border border-slate-300"
        >
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
    <div className="min-h-screen bg-slate-50 text-[#c9d1d9] font-sans selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-50/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/explore")}
            className="group text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm transition-all"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Explorer</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-900 px-4 py-1.5 rounded-full border border-white/10 text-sm transition-all"
            >
              <Share2 size={14} className={isCopied ? "text-green-400" : ""} />
              {isCopied ? "Link Copied!" : "Share Profile"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Sidebar: Profile Identity */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-28 space-y-8">
              <div className="relative group mx-auto lg:mx-0 w-64 lg:w-full aspect-square">
                <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-white">
                  {p.avatarUrl || p.photoURL ? (
                    <img src={p.avatarUrl || p.photoURL} alt={p.displayName} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl font-bold bg-gradient-to-br from-gray-800 to-gray-900 text-slate-400">
                      {(p.displayName || p.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{p.displayName || "Developer"}</h1>
                <p className="text-xl text-purple-400/80 font-medium mt-1">@{p.username || username}</p>
                {p.title && <p className="text-slate-500 mt-4 font-medium italic mb-2">{p.title}</p>}
                {p.bio && <p className="mt-4 text-slate-500 leading-relaxed text-sm">{p.bio}</p>}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {p.location && (
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <MapPin size={16} className="text-purple-500" />
                    {p.location}
                  </div>
                )}
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-500 hover:text-slate-900 text-sm transition-all group">
                    <Linkedin size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    LinkedIn Profile
                  </a>
                )}
                {p.githubUsername && (
                  <a href={`https://github.com/${p.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-500 hover:text-slate-900 text-sm transition-all group">
                    <Github size={16} className="group-hover:scale-110 transition-transform" />
                    GitHub Activity
                  </a>
                )}
              </div>

              {(!user || user.uid !== p.id) && (
                <button
                  onClick={() => setEndorseOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-slate-900 font-bold py-3 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                  Endorse Skills
                </button>
              )}
            </div>
          </div>

          {/* Right Content: Portfolio Details */}
          <div className="flex-1 space-y-12">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Verified Skills", val: verifiedSkills.length, icon: <Code2 size={18} />, color: "text-green-400" },
                { label: "Badges Earned", val: badges.length, icon: <Award size={18} />, color: "text-purple-400" },
                { label: "Endorsements", val: endorsements.length, icon: <MessageSquare size={18} />, color: "text-blue-400" },
                { label: "Repositories", val: repos.length, icon: <Github size={18} />, color: "text-orange-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className={`p-2 w-fit rounded-xl bg-slate-50 mb-4 ${stat.color}`}>{stat.icon}</div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.val}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Skills Showcase */}
            {skills.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    Verified Expertise
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill: any, i: number) => (
                    <div
                      key={i}
                      className={`group relative px-5 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-300 ${
                        skill.verified
                          ? "border-green-500/30 text-green-600 bg-green-50 text-slate-900 hover:bg-green-100"
                          : "border-slate-200 text-slate-500 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {skill.name}
                        {skill.verified && <span className="flex items-center justify-center bg-green-400 text-[#090d14] rounded-full w-4 h-4 text-[10px] font-black">✓</span>}
                      </div>
                      {skill.level && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 text-xs px-1.5 rounded-md border border-slate-300">
                          Lvl {skill.level}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Badges */}
            {badges.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  Skill Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map((badge: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500/30 transition-all group shadow-sm">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-20 transition-all"></div>
                        <img 
                          src={badge.iconUrl || "https://cdn-icons-png.flaticon.com/512/5968/5968863.png"} 
                          className="w-12 h-12 object-contain relative z-10" 
                          alt="" 
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-400 transition-colors">{badge.name}</div>
                        <div className="text-xs text-slate-400">{badge.skillName} • Earned on {new Date(badge.earnedAt || badge.unlockedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Testimonials / Endorsements */}
            {endorsements.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  Peer Endorsements
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {endorsements.slice(0, 5).map((e: any, i: number) => (
                    <div key={i} className="relative bg-white px-8 py-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="absolute top-6 left-3 text-4xl text-slate-900/5 font-serif">“</div>
                      <div className="relative">
                        <p className="text-slate-700 italic mb-6 leading-relaxed">
                          {e.message || "Working together was a great experience. Highly recommended for technical expertise and collaboration."}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-slate-900">
                              {(e.fromName || "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{e.fromName || "Anonymous Colleague"}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{e.fromRole || "Developer"}</div>
                            </div>
                          </div>
                          {e.skills?.length > 0 && (
                            <div className="flex gap-2">
                              {e.skills.slice(0, 2).map((s: string, j: number) => (
                                <span key={j} className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {repos.length > 0 && (() => {
              const pinnedRepos = repos.filter((r: any) => r.isSpotlight);
              const displayRepos = pinnedRepos.length > 0 ? pinnedRepos : repos.slice(0, 6);
              
              return (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    {pinnedRepos.length > 0 ? "Featured Projects" : "GitHub Repositories"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayRepos.map((repo: any, i: number) => (
                    <a 
                      key={i} 
                      href={repo.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group flex flex-col justify-between h-full bg-white border border-slate-200 rounded-3xl p-6 hover:border-orange-500/30 transition-all hover:bg-slate-50 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Github size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                          <ExternalLink size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-orange-400 transition-colors mb-2 truncate">
                          {repo.name}
                        </h3>
                        {repo.description && <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">{repo.description}</p>}
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        {repo.language && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            {repo.language}
                          </div>
                        )}
                        {repo.stars > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                            ★ {repo.stars}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })()}

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
