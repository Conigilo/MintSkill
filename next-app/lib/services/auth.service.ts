/**
 * Refactored Auth Service
 * Handles all authentication operations with better error handling
 */

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  Auth,
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GithubAuthProvider,
  signInWithPopup,
  AuthError,
} from 'firebase/auth'
import type { AuthUser } from '@/lib/types'
import { ERROR_MESSAGES } from '@/lib/constants'
import { auth } from '@/lib/utils/firebase'

const githubProvider = new GithubAuthProvider()

// Configure scopes for better GitHub data access
githubProvider.addScope('read:user')
githubProvider.addScope('user:email')

/**
 * Convert Firebase User to App User type
 */
const convertFirebaseUser = (firebaseUser: User | null): AuthUser | null => {
  if (!firebaseUser) return null

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
}

/**
 * Handle Firebase auth errors
 */
const handleAuthError = (error: AuthError): string => {
  const errorMap: Record<string, string> = {
    'auth/popup-closed-by-user': 'Authentication popup was closed.',
    'auth/cancelled-popup-request': 'Authentication request was cancelled.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email.',
    'auth/auth-domain-config-required': 'Auth domain is not configured.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/unauthorized-domain': 'This domain is not authorized.',
  }

  return errorMap[error.code] || error.message || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Sign in with GitHub
 */
export const loginWithGithub = async (): Promise<{ user: AuthUser; githubToken?: string }> => {
  try {
    const result = await signInWithPopup(auth, githubProvider)
    const credential = GithubAuthProvider.credentialFromResult(result)
    const githubToken = credential?.accessToken

    const appUser = convertFirebaseUser(result.user)
    if (!appUser) {
      throw new Error('Failed to create user object')
    }

    return {
      user: appUser,
      githubToken,
    }
  } catch (error) {
    const message = handleAuthError(error as AuthError)
    throw new Error(message)
  }
}

/**
 * Sign out current user
 */
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    const message = handleAuthError(error as AuthError)
    throw new Error(message)
  }
}

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    const appUser = convertFirebaseUser(firebaseUser)
    callback(appUser)
  })
}

/**
 * Get current auth instance
 */
export const getAuthInstance = (): Auth => {
  return auth
}

/**
 * Get current user
 */
export const getCurrentUser = (): AuthUser | null => {
  const firebaseUser = auth.currentUser
  return convertFirebaseUser(firebaseUser)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null
}

/**
 * Get Firebase ID token for API requests
 */
export async function getIdToken(): Promise<string | null> {
  try {
    if (!auth.currentUser) return null
    return await auth.currentUser.getIdToken()
  } catch (error) {
    console.error('Error getting ID token:', error)
    return null
  }
}

export { auth }
