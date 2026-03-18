'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import {
    signInWithGoogle,
    redirectToGitHub,
    logout,
    onAuthChange,
} from '../services/auth.service'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Hook for managing Firebase authentication state and operations
 * Handles login, logout, and user data management
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [authState, setAuthState] = useState<AuthState>('loading')
    const [error, setError] = useState<string | null>(null)

    /**
     * Subscribe to auth state changes on mount
     */
    useEffect(() => {
        const unsubscribe = onAuthChange(currentUser => {
            setUser(currentUser)
            setAuthState(currentUser ? 'authenticated' : 'unauthenticated')
        })
        
        return unsubscribe
    }, [])

    /**
     * Sign in with Google OAuth
     */
    const loginWithGoogle = useCallback(async () => {
        setError(null)
        try {
            await signInWithGoogle()
        } catch (err: any) {
            // User cancelled the popup, don't show error
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message)
            }
        }
    }, [])

    /**
     * Sign in with GitHub OAuth
     */
    const loginWithGitHub = useCallback(() => {
        redirectToGitHub()
    }, [])

    /**
     * Sign out current user
     */
    const logoutUser = useCallback(async () => {
        setError(null)
        await logout()
    }, [])

    return {
        user,
        error,
        isLoading: authState === 'loading',
        isAuthenticated: authState === 'authenticated',
        isUnauthenticated: authState === 'unauthenticated',
        loginWithGoogle,
        loginWithGitHub,
        logout: logoutUser,
    }
}