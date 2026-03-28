'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner, Alert } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'


export default function LoginPage() {
  const router = useRouter()
  const { user, loading, loginWithGithub, loginWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !loading) {
      router.push(ROUTES.DASHBOARD)
    }
  }, [user, loading, router])

  const handleGitHubLogin = async () => {
    try {
      await loginWithGithub()
      router.push(ROUTES.DASHBOARD)
    } catch (err: any) {
      setError(err.message || "Failed to login with GitHub")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await loginWithGoogle()
      router.push(ROUTES.DASHBOARD)
    } catch (err: any) {
      console.error("Google login error", err)
      setError(err.message || "Failed to login with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmail(email, password)
      router.push(ROUTES.DASHBOARD)
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner label="Authenticating..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center font-sans relative overflow-hidden selection:bg-purple-500/30">

      {/* --- BACKGROUND GLOW --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

      {/* --- MAIN LOGIN CARD --- */}
      <div className="w-full max-w-[440px] px-6 relative z-10 my-10">

        {/* Global Logo/Brand indicator at top */}
        <div className="absolute -top-16 left-0 right-0 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-[11px] font-bold tracking-widest uppercase text-gray-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 flex-shrink-0 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 flex-shrink-0"></span>
            </span>
            SkillLab Pro Now Live
          </div>
        </div>

        <div className="bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-2xl relative">

          {/* Subtle top shimmer */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />

          <div className="text-center mb-8">
            {/* Logo Icon */}
            <div className="w-14 h-14 mx-auto bg-[#090d14] rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-6">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-purple-500 tracking-tight leading-none">
                S.
              </span>
            </div>
            <h1 className="text-[28px] font-serif font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-[14px] text-gray-400">Sign in to access your digital portfolio.</p>
          </div>

          {error && <div className="mb-6"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative rounded-2xl bg-[var(--background)] border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all overflow-hidden flex items-center px-4 py-3.5">
                <svg width="20" height="20" className="flex-shrink-0 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent border-none text-[14px] text-white placeholder-gray-600 outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-[11px] font-bold text-[var(--primary)] hover:text-purple-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative rounded-2xl bg-[var(--background)] border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all overflow-hidden flex items-center px-4 py-3.5">
                <svg width="20" height="20" className="flex-shrink-0 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-none text-[14px] text-white placeholder-gray-600 outline-none tracking-[0.2em]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all transform active:scale-[0.98] bg-[var(--primary)] hover:bg-[#6d28d9] shadow-lg shadow-purple-500/20"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[var(--border)]"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-[var(--border)]"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGitHubLogin}
              disabled={loading || isGoogleLoading}
              className="flex items-center justify-center gap-2.5 bg-[#090d14] hover:bg-gray-800 border border-[var(--border)] rounded-xl py-3 text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
            >
              <svg width="18" height="18" className="flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
              GitHub
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={loading || isGoogleLoading}
              className="flex items-center justify-center gap-2.5 bg-[#090d14] hover:bg-gray-800 border border-[var(--border)] rounded-xl py-3 text-[13px] font-semibold text-white transition-all active:scale-[0.98]">
              <svg width="18" height="18" className="flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </button>
          </div>

          <p className="text-center text-[12px] text-gray-500 mt-8">
            Don't have an account? <Link href="/signup" className="font-bold text-[var(--primary)] hover:text-white transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
