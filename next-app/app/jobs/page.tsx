"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobsService, type JobPosting } from "@/lib/services/jobs.service";
import { useAuth } from "@/lib/hooks/useAuth";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

export default function JobsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const loadJobs = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const data = await jobsService.getJobRecommendations({
                    limit: 20,
                    minMatchScore: filter === 'recommended' ? 70 : undefined,
                });
                setJobs(data || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load jobs');
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadJobs();
    }, [user, filter]);

    const getMatchColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getMatchStatus = (score: number) => {
        if (score >= 80) return 'Highly Recommended';
        if (score >= 60) return 'Good Match';
        return 'Skill Gap Detected';
    };

    return (
        <SidebarLayout activePage="jobs">
        <div className="text-white p-10 relative">
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Skill-Matched Jobs</h1>
                
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filter === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        All Jobs
                    </button>
                    <button
                        onClick={() => setFilter('recommended')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filter === 'recommended'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        Highly Recommended
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-400">Loading jobs...</div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400">No jobs found matching your criteria</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    {jobs.map(job => (
                        <div
                            key={job.id}
                            className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-blue-400 mb-1">{job.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        {job.company} 
                                        {job.location && ` • ${job.location}`}
                                        {job.salary && ` • ${job.salary}`}
                                    </p>
                                    
                                    {job.description && (
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.description}</p>
                                    )}

                                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {job.requiredSkills.slice(0, 5).map((skill, i) => (
                                                <span key={i} className="text-xs border border-gray-700 bg-gray-900/50 px-2 py-1 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.requiredSkills.length > 5 && (
                                                <span className="text-xs border border-gray-700 bg-gray-900/50 px-2 py-1 rounded text-gray-400">
                                                    +{job.requiredSkills.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-right ml-6">
                                    {job.matchScore !== undefined && (
                                        <>
                                            <div className={`text-lg font-bold mb-2 ${getMatchColor(job.matchScore)}`}>
                                                {job.matchScore}% Match
                                            </div>
                                            <p className="text-xs text-gray-400 mb-4">
                                                {getMatchStatus(job.matchScore)}
                                            </p>
                                        </>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (job.link) window.open(job.link, '_blank');
                                        }}
                                        className="bg-white text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-all"
                                    >
                                        View Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
        </SidebarLayout>
    );
}