"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Alert } from "@/components/ui";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
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
            } else {
                setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
            {isSubmitting && <div className="top-loading-bar" />}
            {/* 📍 Back to Home */}
            <Link
                href="/"
                className="absolute top-8 left-8 text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors z-50"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Home
            </Link>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white border border-slate-200/60 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                <div className="mb-10 flex justify-center items-center">
                    <img src="/logo.png" alt="Logo" className="h-32 w-auto object-contain" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">CREATE ACCOUNT</h1>
                    <p className="text-slate-500 text-sm">Join the verified developer community.</p>
                </div>

                {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError("")} /></div>}
                <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 outline-none focus:border-[#b864ff] transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 outline-none focus:border-[#b864ff] transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 outline-none focus:border-[#b864ff] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#b864ff] hover:bg-[#a34df2] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 mt-4 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="flex items-center my-8">
                    <div className="flex-1 border-t border-slate-100"></div>
                    <span className="px-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">Or</span>
                    <div className="flex-1 border-t border-slate-100"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        type="button"
                        onClick={loginWithGithub}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-all active:scale-[0.95]"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                        GitHub
                    </button>
                    <button
                        type="button"
                        onClick={loginWithGoogle}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-all active:scale-[0.95]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </button>
                </div>

                <div className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#b864ff] font-bold hover:text-purple-600 transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}