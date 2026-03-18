'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Login page with OAuth providers
 */
export default function LoginPage() {
    const router = useRouter()
    const {
        isAuthenticated,
        isLoading,
        loginWithGoogle,
        loginWithGitHub,
        error,
    } = useAuth()

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [isAuthenticated, router])

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                {/* Loading content */}
                <div className="flex flex-col items-center gap-6 z-10">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-2 border-gray-700 rounded-full" />
                        <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-gray-400">Signing you in...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Content container */}
            <div className="w-full max-w-sm space-y-8 relative z-10">
                {/* Header */}
                <LoginHeader />

                {/* Login Card */}
                <LoginCard
                    onGitHubLogin={loginWithGitHub}
                    onGoogleLogin={loginWithGoogle}
                    error={error}
                />

                {/* Footer */}
                <TermsFooter />
            </div>
        </div>
    )
}

/**
 * Login page header with branding
 */
function LoginHeader() {
    return (
        <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                skill<span className="text-blue-400">wallet</span>
            </h1>
            <p className="text-sm text-gray-400">
                Build and verify your developer portfolio with endorsed skills
            </p>
        </div>
    )
}

/**
 * Login options card
 */
function LoginCard({
    onGitHubLogin,
    onGoogleLogin,
    error,
}: {
    onGitHubLogin: () => void
    onGoogleLogin: () => void
    error: string | null
}) {
    return (
        <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-gray-900/30 shadow-2xl p-8 space-y-6 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
            {/* Title */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome</h2>
                <p className="text-sm text-gray-400">
                    Sign in to showcase your verified skills
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-3 flex items-start gap-3 animate-pulse">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* GitHub Login */}
            <div className="space-y-2">
                <Button
                    variant="default"
                    className="w-full h-11 gap-3 font-semibold bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    onClick={onGitHubLogin}
                >
                    <GitHubIcon />
                    <span>Continue with GitHub</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Button>
                <p className="text-xs text-gray-500 text-center">
                    ⭐ Recommended — auto-syncs your repositories and skills
                </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <span className="text-xs text-gray-500 font-medium px-2">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>

            {/* Google Login */}
            <Button
                variant="outline"
                className="w-full h-11 gap-3 font-semibold text-gray-300 border border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-200 group"
                onClick={onGoogleLogin}
            >
                <GoogleIcon />
                <span>Continue with Google</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Button>
        </div>
    )
}

/**
 * Terms and conditions footer
 */
function TermsFooter() {
    return (
        <div className="text-center space-y-4 pt-8">
            {/* Features highlight */}
            <div className="grid grid-cols-3 gap-4 py-6 px-4 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-300">Verify Skills</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-300">Earn Badges</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2m0 0h-2m2 0v-2m0 2v2m0-11a9 9 0 110 18 9 9 0 010-18z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-300">Show Stats</span>
                </div>
            </div>

            {/* Legal text */}
            <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Terms
                </a>
                {' '}and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Privacy Policy
                </a>
            </p>
        </div>
    )
}

/**
 * Google logo icon SVG
 */
function GoogleIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

/**
 * GitHub logo icon SVG
 */
function GitHubIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    )
}