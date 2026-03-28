// components/dashboard/CVTemplate.tsx
export default function CVTemplate() {
    return (
        // คลาส `hidden print:block` คือหัวใจหลัก: ซ่อนในหน้าเว็บปกติ แต่โชว์ตอนสั่ง Print
        <div className="hidden print:block bg-white text-black p-8 font-sans w-full max-w-[21cm] mx-auto min-h-[29.7cm]">

            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">Sarit Sridit</h1>
                <p className="text-sm">
                    Bangkok, Thailand • github.com/conigilo • linkedin.com/in/conigilo
                </p>
                <p className="text-sm mt-1">Full-Stack Developer & Applied Computer Science Student</p>
            </div>

            {/* Section: Education */}
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Education</h2>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold">Faculty of Science, Applied Computer Science</h3>
                        <p className="italic">2nd Year Undergraduate Student</p>
                    </div>
                    <span className="font-bold">Expected 2028</span>
                </div>
            </div>
            {/* Section: Projects */}
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Technical Projects</h2>

                <div className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">Skill Wallet Platform</h3>
                        <span className="text-sm italic">Next.js, Tailwind, React</span>
                    </div>
                    <ul className="list-disc list-inside text-sm mt-1">
                        <li>Developed a web application for developers to verify technical skills via AI assessments.</li>
                        <li>Implemented a peer-to-peer endorsement system with real-time state management.</li>
                        <li>Designed a responsive, production-ready Dashboard UI using Tailwind CSS.</li>
                    </ul>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">LINE Beacon Mutual-Help Network</h3>
                        <span className="text-sm italic">LINE Mini App, AI</span>
                    </div>
                    <ul className="list-disc list-inside text-sm mt-1">
                        <li>Created a real-time, location-based network using LINE Beacon technology.</li>
                    </ul>
                </div>
            </div>

            {/* Section: Verified Skills (ดึงข้อมูลจำลองมาโชว์) */}
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Verified Skills (Skill Wallet)</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Languages:</strong> JavaScript, TypeScript, Python, C++, Java</li>
                    <li><strong>Frontend & Web:</strong> React, Next.js, HTML/CSS (Vanilla & Tailwind)</li>
                    <li><strong>Backend & DB:</strong> Node.js, SQL, Object-Oriented Programming (OOP)</li>
                    <li><strong>Concepts:</strong> Data Structures & Algorithms, OS Concepts, Quantitative Finance</li>
                </ul>
            </div>


        </div>
    );
}