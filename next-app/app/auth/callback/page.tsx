'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error] = useState<string>(() => {
        const code = searchParams?.get('code')
        const err = searchParams?.get('error')
        
        if (err) {
            return err
        } else if (!code) {
            return 'No authorization code received'
        }
        return ''
    })

    useEffect(() => {
        const code = searchParams?.get('code')
        
        if (!error && code) {
            // In a popup-based flow, we redirect directly to dashboard
            // In a redirect-based flow, you would exchange the code here
            router.replace('/dashboard')
        }
    }, [error, router, searchParams])

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

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            }
        >
            <AuthCallbackContent />
        </Suspense>
    )
}