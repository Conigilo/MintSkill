"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function LandingPage() {
    const router = useRouter();
    const { user, loading, logout, loginWithGithub } = useAuth();
    const [imgSrc, setImgSrc] = useState("/logo.png");
    const [isGithubLoading, setIsGithubLoading] = useState(false);

    // สร้างฟังก์ชันจัดการการล็อกอิน
    const handleGitHubLogin = async () => {
        try {
            setIsGithubLoading(true);
            const result = await loginWithGithub();
            if (result) router.push("/dashboard"); // ล็อกอินสำเร็จให้ไปหน้า dashboard
        } catch (err: any) {
            console.error("Failed to login with GitHub", err);
        } finally {
            setIsGithubLoading(false);
        }
    };


    useEffect(() => {
        setImgSrc(`/logo.png?t=${Date.now()}`);
    }, []);

    return (
        <div className="lp-root">
            <DarkModeToggle />
            {/* Background Decorations */}
            <div className="lp-blob lp-blob-1" />
            <div className="lp-blob lp-blob-2" />

            {/* Navigation */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo-area" onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
                        <img
                            src={imgSrc}
                            alt="MinkSkill Logo"
                            style={{ height: '150px', width: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    <div className="lp-nav-right">
                        {loading ? (
                            <div className="lp-nav-skeleton" />
                        ) : user ? (
                            <button onClick={logout} className="lp-btn-nav-ghost">
                                Sign Out
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push("/login")}
                                className="lp-btn-nav-ghost"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="lp-hero">
                <div className="lp-hero-content">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                        Prove your skills <br />
                        <span className="text-indigo-600">
                            Not just your resume
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        An AI Verified Professional Portfolio that turns your GitHub
                        Contributions into Verifiable Badges and Certificates
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {user ? (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Open Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleGitHubLogin}
                                    disabled={isGithubLoading}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isGithubLoading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                                            </svg>
                                            Login with GitHub
                                        </>
                                    )}
                                </button>

                                <a href="#features" className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                    Learn More
                                </a>
                            </>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-24 pt-12 border-t border-slate-100 flex flex-wrap items-center justify-center gap-12 md:gap-24">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-slate-900">10k+</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Developers</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-slate-900">50k+</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Skills Verified</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-slate-900">98%</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Accuracy</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="lp-features">
                <div className="lp-features-header">
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="lp-h2">Everything you need to stand out</h2>
                    </div>
                </div>

                <div className="lp-features-grid">
                    <div className="lp-card lp-card-blue">
                        <h3 className="lp-card-title">AI-Powered Verification</h3>
                        <p className="lp-card-desc">
                            We analyze your GitHub repositories and generate personalized
                            technical assessments to prove your actual coding skills.
                        </p>
                        <div className="lp-card-tags">
                            <span className="lp-tag">GitHub Analysis</span>
                            <span className="lp-tag">AI Quiz</span>
                        </div>
                    </div>

                    <div className="lp-card lp-card-purple lp-card-featured">
                        <div className="lp-featured-pill">Most Popular</div>
                        <h3 className="lp-card-title">Peer Endorsements</h3>
                        <p className="lp-card-desc">
                            Request and receive verifiable endorsements from colleagues,
                            classmates, and mentors to build real social proof.
                        </p>
                        <div className="lp-card-tags">
                            <span className="lp-tag">Social Proof</span>
                            <span className="lp-tag">Verified</span>
                        </div>
                    </div>

                    <div className="lp-card lp-card-emerald">
                        <h3 className="lp-card-title">Shareable Widgets</h3>
                        <p className="lp-card-desc">
                            Export your verified skills as a beautiful PDF resume or embed
                            a dynamic widget directly onto your personal website.
                        </p>
                        <div className="lp-card-tags">
                            <span className="lp-tag">PDF Export</span>
                            <span className="lp-tag">Embeddable</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-logo">
                    <img src={imgSrc} alt="Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <p className="lp-footer-copy">
                    © 2026 Skill Wallet · Built with Next.js · Designed for Developers
                </p>
            </footer>
        </div>
    );
}   