"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUpWithEmail, loginWithGoogle, loginWithGithub } = useAuth();
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await signUpWithEmail(name, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                setError("อีเมลนี้ถูกใช้งานไปแล้ว");
            } else if (err.code === "auth/weak-password") {
                setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            } else if (err.code === "auth/operation-not-allowed") {
                setError("Email/Password signup is temporarily unavailable. Please use Google or GitHub to sign up.");
            } else {
                setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            {/* Badge */}
            <div className="mb-8 bg-white border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-700 font-bold tracking-wider uppercase">SKILL WALLET</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white border border-slate-200/60 p-10 rounded-[2rem] shadow-2xl">

                {/* Logo */}
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-black text-purple-500">S.</span>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 font-serif tracking-tight">CREATE ACCOUNT</h1>
                    <p className="text-slate-500 text-sm">Join us to build your verified portfolio.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium animate-pulse">
                        {error}
                    </div>
                )}


                {/* Form */}
                <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Name Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z"></path></svg>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Or continue with</span>
                    <div className="flex-1 border-t border-slate-200"></div>
                </div>

                {/* Social Buttons */}
                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">

                    {/* ปุ่ม GitHub */}
                    <button
                        type="button"
                        onClick={loginWithGithub}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 font-bold py-3 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                        GitHub
                    </button>

                    {/* ปุ่ม Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 font-bold py-3 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </button>

                </div>
                {/* Footer Link */}
                <div className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                        Sign in
                    </Link>
                </div>
                {/* 📍 ปุ่มย้อนกลับ (มุมซ้ายบน) */}
                <Link
                    href="/"
                    className="absolute top-8 left-8 text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors z-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}