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
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="lp-hero">
                <div className="lp-hero-content">
                    <h1 className="lp-h1">
                        Prove your skills <br />
                        <span className="lp-h1-accent-static">Not just your resume</span>
                    </h1>

                    <p className="lp-subtext">
                        Connect your GitHub, pass AI powered assessments, and get endorsed
                        by peers. Build a verified portfolio that actually lands you jobs.
                    </p>

                    <div className="lp-cta-row">
                        {user ? (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="lp-btn-hero-primary"
                            >
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="mr-2">
                                    <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.7" />
                                    <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" />
                                    <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" />
                                    <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.7" />
                                </svg>
                                Open Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push("/login")}
                                className="lp-btn-hero-primary"
                            >
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="mr-2">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                Start with GitHub
                            </button>
                        )}
                        <a href="#features" className="lp-btn-hero-ghost">
                            view more
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className="lp-trust-bar">
                        <div className="lp-trust-item">
                            <span className="lp-trust-num">10k+</span>
                            <span className="lp-trust-label">Developers</span>
                        </div>
                        <div className="lp-trust-sep" />
                        <div className="lp-trust-item">
                            <span className="lp-trust-num">50k+</span>
                            <span className="lp-trust-label">Skills Verified</span>
                        </div>
                        <div className="lp-trust-sep" />
                        <div className="lp-trust-item">
                            <span className="lp-trust-num">98%</span>
                            <span className="lp-trust-label">Accuracy</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="lp-features">
                <div className="lp-features-header">
                    <p className="lp-eyebrow">Why Skill Wallet?</p>
                    <h2 className="lp-h2">Everything you need to stand out</h2>
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
                    <img src={imgSrc} alt="Logo" style={{ height: '100px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <p className="lp-footer-copy">
                    © 2026 MintSkll · Built with Next.js · Designed for Developers
                </p>
            </footer>
        </div>
    );
}