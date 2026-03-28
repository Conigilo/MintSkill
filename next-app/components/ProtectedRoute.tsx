/**
 * Protected Route Component - Redirect unauthenticated users
 */

'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { LoadingSpinner } from '@/components/ui'
import { ROUTES } from '@/lib/constants'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN)
    return null
  }

  return <>{children}</>
}
