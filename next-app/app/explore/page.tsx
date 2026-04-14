"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { developersService, type Developer } from "@/lib/services/developers.service";
import { useAuth } from "@/lib/hooks/useAuth";
import EndorseModal from "@/components/EndorseModal";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

export default function ExplorePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [endorseTarget, setEndorseTarget] = useState<{ id: string; name: string } | null>(null);

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
        <div className="text-white p-10 relative">
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Explore Developers</h1>
                <input
                    type="text"
                    placeholder="Search by name, skill, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-400">Loading developers...</div>
                </div>
            ) : developers.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 mb-4">No developers found</p>
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
                            className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
                        >
                            <div
                                onClick={() => router.push(`/profile/${getHandle(dev)}`)}
                                className="cursor-pointer flex-1"
                            >
                                <div className="flex gap-4 items-center mb-4">
                                    {dev.photoURL ? (
                                        <img 
                                            src={dev.photoURL}
                                            alt={dev.name || 'Developer'}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                                            {getName(dev).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold">{getName(dev)}</h3>
                                        <p className="text-sm text-gray-400">{dev.title || 'Professional'}</p>
                                    </div>
                                </div>
                                
                                {dev.bio && (
                                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{dev.bio}</p>
                                )}

                                {dev.matchScore && (
                                    <p className="text-xs text-green-400 mb-3 font-semibold">{dev.matchScore}% Skill Match</p>
                                )}

                                {dev.topSkills && dev.topSkills.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {dev.topSkills.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">
                                                {skill.name}
                                            </span>
                                        ))}
                                        {dev.topSkills.length > 3 && (
                                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                                                +{dev.topSkills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Endorse button — only for logged-in users endorsing others */}
                            {user && user.uid !== dev.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEndorseTarget({ id: dev.id, name: getName(dev) });
                                    }}
                                    className="mt-2 w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium transition-colors"
                                >
                                    Endorse
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Endorse Modal */}
            {endorseTarget && (
                <EndorseModal
                    targetUserId={endorseTarget.id}
                    targetName={endorseTarget.name}
                    onClose={() => setEndorseTarget(null)}
                    onSuccess={() => setEndorseTarget(null)}
                />
            )}
            </div>
        </div>
        </SidebarLayout>
    );
}