'use client';

import { useState, useEffect } from "react";

interface CVTemplateProps {
    user: any;
    skills: any[] | undefined;
}

export default function CVTemplate({ user, skills }: CVTemplateProps) {
    const [resumeData, setResumeData] = useState<any>(null);

    // 1. ดึงข้อมูลจาก LocalStorage ทุกครั้งที่เริ่มการเรนเดอร์ (Mount)
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('skill-wallet-resume');
            if (savedData) {
                setResumeData(JSON.parse(savedData).resume);
            }
        } catch (e) {
            console.error("Error loading resume data:", e);
        }
    }, [user?.uid]);

    // 2. ดึง Skill ที่ Verified จากระบบ (ทักษะทางเทคนิคจะแยกจากข้อมูลแมนวลอื่นๆ)
    const verifiedSkills = skills?.filter(s => s.verified).map(s => s.name) || [];

    // 3. เตรียมข้อมูล ถ้ายังไม่มีให้ใส่ Placeholder กัน Error
    const fullName = resumeData?.fullName || user?.displayName || "Sarit Sridit";
    const jobTitle = resumeData?.title || "Developer";
    const contactLine = [
        resumeData?.phone && `Tel: ${resumeData.phone}`,
        resumeData?.email && `Email: ${resumeData.email}`,
    ].filter(Boolean).join(' • ');

    const education = resumeData?.education || [];
    const activities = resumeData?.activities || [];
    const projects = resumeData?.projects || [];
    const strengths = resumeData?.strengths || [];

    return (
        // สำคัญมาก: ต้องมีคลาส `print-visible` เพื่อให้ทะลุการซ่อน (visibility: hidden) ใน globals.css
        <div className="hidden print:block print-visible bg-white text-black p-8 font-sans w-full max-w-[21cm] mx-auto min-h-[29.7cm]">

            {/* Header: ข้อมูลส่วนตัว */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{fullName}</h1>
                {contactLine && <p className="text-sm">{contactLine}</p>}
                <p className="text-sm mt-1">{jobTitle}</p>
            </div>

            {/* Section: Education */}
            {education.length > 0 && <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Education</h2>
                {education.map((edu: any, index: number) => (
                    <div key={index} className="mb-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold">{edu.school || 'University Name'}</h3>
                            <span className="font-bold">{edu.year}</span>
                        </div>
                        {edu.degree && <p className="text-sm mt-1">{edu.degree} {edu.gpax && `(GPAX: ${edu.gpax})`}</p>}
                    </div>
                ))}
            </div>}

            {/* Section: Activity & Achievement */}
            {activities.length > 0 && <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Activity & Achievement</h2>
                {activities.map((act: any, index: number) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold">{act.title || 'Activity Title'}</h3>
                            <span className="text-sm">{act.date}</span>
                        </div>
                        {act.details && act.details.length > 0 && (
                            <ul className="list-disc list-inside text-sm mt-1">
                                {act.details.map((detail: string, i: number) => (
                                    <li key={i}>{detail}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>}

            {/* Section: Technical Projects */}
            {projects.length > 0 && <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Technical Projects</h2>
                {projects.map((proj: any, index: number) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold">{proj.name || 'Project Name'}</h3>
                            <span className="text-sm">{proj.date}</span>
                        </div>
                        {proj.details && proj.details.length > 0 && (
                            <ul className="list-disc list-inside text-sm mt-1">
                                {proj.details.map((detail: string, i: number) => (
                                    <li key={i}>{detail}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>}

            {/* Section: Technical Skills */}
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Technical Skills & Strengths</h2>
                
                {verifiedSkills.length > 0 && (
                    <div className="text-sm mb-3">
                        <span className="font-bold">Verified Skills: </span>
                        {verifiedSkills.join(', ')}
                    </div>
                )}
                
                {strengths.length > 0 && (
                     <ul className="list-disc list-inside text-sm space-y-1">
                        {strengths.map((str: string, index: number) => (
                            <li key={index}>{str}</li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
}