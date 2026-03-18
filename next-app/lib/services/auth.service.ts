import {
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithCustomToken,
    onAuthStateChanged,
    type User,
} from 'firebase/auth'
import { firebaseAuth } from '../firebase'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

// Google Auth Setup
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

/**
 * Sign in user with Google OAuth
 */
export async function signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(firebaseAuth, googleProvider)
    return result.user
}

/**
 * Redirect user to GitHub OAuth authorization page
 * GitHub OAuth requires backend to handle client_secret
 */
export function redirectToGitHub() {
    const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
        scope: 'read:user repo',
        redirect_uri: `${window.location.origin}/auth/callback`,
    })
    
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

/**
 * Handle GitHub OAuth callback
 * Exchanges GitHub code for Firebase custom token
 */
export async function handleGitHubCallback(code: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    })
    
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'GitHub login failed')
    }
    
    const { token } = await response.json()
    const result = await signInWithCustomToken(firebaseAuth, token)
    
    return result.user
}

/**
 * Sign out user and revoke tokens on backend
 */
export async function logout() {
    const token = await firebaseAuth.currentUser?.getIdToken()
    
    if (token) {
        // Notify backend to revoke tokens
        fetch(`${API_URL}/auth/logout`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {
            // Silently ignore backend errors
        })
    }
    
    await signOut(firebaseAuth)
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(firebaseAuth, callback)
}