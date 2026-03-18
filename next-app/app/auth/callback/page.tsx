'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleGitHubCallback } from '@/lib/services/auth.service'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState('')

    useEffect(() => {
        const code = searchParams.get('code')
        const err = searchParams.get('error')

        if (err || !code) {
            setError(err ?? 'No authorization code received')
            return
        }

        handleGitHubCallback(code)
            .then(() => router.replace('/dashboard'))
            .catch((e) => setError(e.message))
    }, [])

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-destructive font-medium">Login failed</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button
                        onClick={() => router.replace('/login')}
                        className="text-sm text-primary hover:underline"
                    >
                        ← Try again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Connecting GitHub...</p>
            </div>
        </div>
    )
}