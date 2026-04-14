"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LandingPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    // ถ้า Login แล้ว ก็ไม่ต้องเด้งไปทันที เพื่อให้เห็น Landing Page ก่อน
    // แต่เราจะเปลี่ยนปุ่ม Hero เป็น "Go to Dashboard" แทน

    return (
        <div className="min-h-screen bg-[#090d14] text-white font-sans overflow-hidden relative">

            {/* Background Effects (แสง Glow แบบอนาคต) */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none"></div>

            {/* 1. Navbar */}
            <nav className="border-b border-gray-800/50 bg-[#090d14]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
                        SKILL WALLET
                    </span>

                    {loading ? (
                        <div className="w-24 h-9 bg-gray-800 animate-pulse rounded-full"></div>
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            {user.photoURL && <Image src={user.photoURL} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full border border-gray-700" />}
                            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors">Sign Out</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push("/login")}
                            className="text-sm bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full font-bold transition-all"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">

                {/* 2. Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        The Future of Developer Portfolios
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Prove your skills <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400">
                            Not just your resume
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Connect your GitHub, pass AI-powered assessments, and get endorsed by peers. Build a verified portfolio that actually lands you jobs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {user ? (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-105"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                                Get Started with GitHub
                            </button>
                        )}
                        <a href="#features" className="text-gray-400 hover:text-white font-medium px-6 py-4">
                            Learn more
                        </a>
                    </div>
                </div>

                {/* 3. Features */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32">

                    <div className="bg-[#161b22]/50 border border-gray-800 p-8 rounded-3xl hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">AI-Powered Verification</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We analyze your GitHub repositories and generate personalized technical assessments to prove your actual coding skills.
                        </p>
                    </div>
                    <div className="bg-[#161b22]/50 border border-gray-800 p-8 rounded-3xl hover:border-purple-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                            <span className="text-2xl">🤝</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Peer Endorsements</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Request and receive verifiable endorsements from colleagues, classmates, and mentors to build social proof.
                        </p>
                    </div>

                    <div className="bg-[#161b22]/50 border border-gray-800 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Shareable Widgets</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Export your verified skills as a beautiful PDF resume or embed a dynamic widget directly onto your personal website.
                        </p>
                    </div>

                </div>

            </main>

            <footer className="border-t border-gray-800/50 bg-[#090d14] py-8 text-center text-gray-500 text-sm">
                <p>Built with Next.js & Tailwind CSS. Designed for Developers.</p>
            </footer>
        </div>
    );
}