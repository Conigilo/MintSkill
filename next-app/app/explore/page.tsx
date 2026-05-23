"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { developersService, type Developer } from "@/lib/services/developers.service";
import { useAuth } from "@/lib/hooks/useAuth";
import RequestEndorseModal from "@/components/RequestEndorseModal";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

export default function ExplorePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [endorseTarget, setEndorseTarget] = useState<{ id: string; name: string; email?: string } | null>(null);

    // Helper to get best display name from Firestore user data
    const getName = (dev: any) => dev.name || dev.displayName || 'Developer';
    const getHandle = (dev: any) => dev.username || dev.handle || dev.id;

    useEffect(() => {
        const loadDevelopers = async () => {
            setIsLoading(true);
            try {
                const data = await developersService.searchDevelopers(searchQuery || undefined, { limit: 12 });
                setDevelopers(data || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load developers');
                setDevelopers([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(loadDevelopers, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <SidebarLayout activePage="explore">
        <div className="text-slate-800 dark:text-slate-100 p-10 relative">
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Explore Developers</h1>
                <input
                    type="text"
                    placeholder="Search by name, skill, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#ffffff] border border-slate-300 text-slate-900 placeholder-gray-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#0d1117] dark:border-[#30363d] dark:text-[#f0f6fc]"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-slate-500">Loading developers...</div>
                </div>
            ) : developers.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 mb-4">No developers found</p>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {developers.map(dev => (
                        <div 
                            key={dev.id}
                            className="bg-[#ffffff] border border-slate-200/80 p-6 rounded-2xl dark:bg-[#161b22] dark:border-[#30363d] hover:border-slate-300 dark:hover:border-[#484f58] transition-all hover:shadow-md flex flex-col justify-between"
                        >
                            <div className="flex-1">
                                <div className="flex gap-4 items-center mb-4">
                                    {dev.photoURL ? (
                                        <img 
                                            src={dev.photoURL}
                                            alt={getName(dev)}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center font-bold text-lg text-white"
                                        style={{ display: dev.photoURL ? 'none' : 'flex' }}
                                    >
                                        {getName(dev).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-[#f0f6fc]">{getName(dev)}</h3>
                                        <p className="text-xs text-slate-400 dark:text-[#8b949e]">{dev.title || 'Professional'}</p>
                                    </div>
                                </div>
                                
                                {dev.bio && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{dev.bio}</p>
                                )}

                                {dev.matchScore && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mb-3 font-semibold">{dev.matchScore}% Skill Match</p>
                                )}

                                {dev.topSkills && dev.topSkills.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {dev.topSkills.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="text-xs bg-slate-100 dark:bg-[#21262d] dark:text-[#8b949e] px-2 py-1 rounded">
                                                {skill.name}
                                            </span>
                                        ))}
                                        {dev.topSkills.length > 3 && (
                                            <span className="text-xs bg-slate-100 dark:bg-[#21262d] dark:text-[#8b949e] px-2 py-1 rounded text-slate-500">
                                                +{dev.topSkills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons Row */}
                            <div className="mt-4 flex gap-2 w-full">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/profile/${getHandle(dev)}`);
                                    }}
                                    className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-[#21262d] dark:hover:bg-[#30363d] rounded-xl transition-all select-none border border-slate-200/60 dark:border-transparent text-center"
                                >
                                    ดูโปรไฟล์เต็ม
                                </button>
                                {user && user.uid !== dev.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEndorseTarget({ id: dev.id, name: getName(dev), email: dev.email });
                                        }}
                                        className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all border border-blue-100 dark:border-transparent select-none text-center"
                                    >
                                        ขอคำรับรอง
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Request Endorse Modal */}
            {endorseTarget && (
                <RequestEndorseModal
                    targetUserId={endorseTarget.id}
                    targetName={endorseTarget.name}
                    targetEmail={endorseTarget.email}
                    onClose={() => setEndorseTarget(null)}
                    onSuccess={() => setEndorseTarget(null)}
                />
            )}
            </div>
        </div>
        </SidebarLayout>
    );
}