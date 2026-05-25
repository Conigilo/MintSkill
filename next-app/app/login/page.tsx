"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Alert } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginWithGithub, loginWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);

  const handleGitHubLogin = async () => {
    try {
      setIsGithubLoading(true);
      setError(null);
      const result = await loginWithGithub();
      if (result) router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Failed to login with GitHub");
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      const result = await loginWithGoogle();
      if (result) router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmail(email.trim(), password);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากคุณสมัครสมาชิกผ่าน Google หรือ GitHub ให้กดล็อกอินด้วยปุ่มด้านบนครับ)");
      } else {
        setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex flex-col items-center justify-center p-6 relative selection:bg-indigo-500/20">
      {/* 📍 Back to Home */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-xs font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors z-50"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-slate-200/70 dark:border-[#30363d] p-8 rounded-2xl shadow-sm">
        {/* Logo Container */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-16 h-16 rounded-xl bg-slate-50 dark:bg-[#0d1117] flex items-center justify-center p-2.5 border border-slate-100 dark:border-[#30363d]">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={48} 
              height={48} 
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Sign in to manage your verified skills and badge portfolio.</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* SSO Stack (Google & GitHub) */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={isGithubLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {isGithubLoading ? "Connecting to GitHub..." : "Continue with GitHub"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGithubLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 dark:border-[#30363d] dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-[#21262d] text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-200/50 dark:border-[#30363d]"></div>
          <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 border-t border-slate-200/50 dark:border-[#30363d]"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center pl-0.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</label>
              <Link href="#" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Forgot?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm shadow-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}