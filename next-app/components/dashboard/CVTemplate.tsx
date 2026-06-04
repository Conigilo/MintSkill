'use client';

import { useState, useEffect } from "react";

interface CVTemplateProps {
    user: any;
    skills: any[] | undefined;
}

export default function CVTemplate({ user, skills }: CVTemplateProps) {
    const [resumeData, setResumeData] = useState<any>(null);

    // 1. ดึงข้อมูลจาก LocalStorage เมื่อ user?.uid เปลี่ยนแปลง
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('skill-wallet-resume');
            if (savedData) {
                const resume = JSON.parse(savedData).resume;
                setResumeData((prev: any) => {
                    if (JSON.stringify(prev) === JSON.stringify(resume)) return prev;
                    return resume;
                });
            }
        } catch (e) {
            console.error("Error loading resume data:", e);
        }
    }, [user?.uid]);

    // 2. ดึง Skill ที่ Verified จากระบบ (ทักษะทางเทคนิคจะแยกจากข้อมูลแมนวลอื่นๆ)
    const verifiedSkills = skills?.filter(s => s.verified).map(s => s.name) || [];

    // 3. เตรียมข้อมูล
    const fullName = resumeData?.fullName || user?.displayName || "User";
    const jobTitle = resumeData?.title || "Developer";
    
    const contactLine = [
        resumeData?.email && `Email: ${resumeData.email}`,
        resumeData?.githubUsername && `GitHub: github.com/${resumeData.githubUsername}`,
        resumeData?.linkedinUrl && `LinkedIn: ${resumeData.linkedinUrl}`,
        resumeData?.location && `Location: ${resumeData.location}`
    ].filter(Boolean).join('  •  ');

    const bio = resumeData?.bio || "";
    const projects = Array.isArray(resumeData?.projects) ? resumeData.projects : [];

    return (
        // สำคัญมาก: ต้องมีคลาส `print-visible` เพื่อให้ทะลุการซ่อน (visibility: hidden) ใน globals.css
        <div className="hidden print:block print-visible bg-white text-black p-8 font-sans w-full max-w-[21cm] mx-auto min-h-[29.7cm]">

            {/* Header: ข้อมูลส่วนตัว */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{fullName}</h1>
                <p className="text-sm font-semibold mb-1">{jobTitle}</p>
                {contactLine && <p className="text-xs">{contactLine}</p>}
            </div>

            {/* Section: About Me */}
            {bio && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">About Me</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{bio}</p>
                </div>
            )}

            {/* Section: Technical Projects (GitHub) */}
            {projects.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Featured Projects</h2>
                    {projects.map((proj: any, index: number) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{`"${proj.name || 'Project Name'}"`}</h3>
                                <span className="text-sm font-mono text-gray-500">{proj.date}</span>
                            </div>
                            {proj.details && proj.details.length > 0 && (
                                <ul className="list-disc list-inside text-sm mt-1">
                                    {proj.details.map((detail: string, i: number) => (
                                        <li key={i} className="leading-relaxed">{detail}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Section: Technical Skills */}
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Technical Skills</h2>
                
                {verifiedSkills.length > 0 && (
                    <div className="text-sm flex flex-wrap gap-2 mt-1">
                        {verifiedSkills.map((skill, sIdx) => (
                            <span key={sIdx} className="bg-gray-150 border border-gray-300 px-2 py-0.5 rounded text-xs font-semibold">
                                • {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}