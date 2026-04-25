"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [imgSrc, setImgSrc] = useState("/logo.png");

    // Force refresh logo if it's not updating
    useEffect(() => {
        setImgSrc(`/logo.png?t=${Date.now()}`);
    }, []);

    return (
        <div className="lp-root">
            {/* Background Decorations */}
            <div className="lp-blob lp-blob-1" />
            <div className="lp-blob lp-blob-2" />

            {/* Navigation */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo-area" onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
                        <img
                            src={imgSrc}
                            alt="Skill Wallet Logo"
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
                                    onClick={() => router.push("/login")}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Get Started
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
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
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