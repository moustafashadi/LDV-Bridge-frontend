'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth, type UserRole } from '@/lib/hooks/use-auth'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: UserRole[]
  fallbackUrl?: string
  loadingComponent?: React.ReactNode
}

/**
 * Protected Route Component
 * Wraps pages that require specific roles
 * Automatically redirects unauthorized users
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  fallbackUrl = '/unauthorized',
  loadingComponent 
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, isAuthenticated } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Only run redirect logic once loading is complete and we haven't redirected yet
    if (!isLoading && !hasRedirected) {
      // Not authenticated - redirect to login
      if (!isAuthenticated || !user) {
        setHasRedirected(true)
        router.push('/auth/login')
        return
      }

      // Authenticated but wrong role - redirect to unauthorized
      if (!hasRole(requiredRoles)) {
        setHasRedirected(true)
        router.push(fallbackUrl)
        return
      }
    }
  }, [user, isLoading, hasRole, requiredRoles, router, fallbackUrl, isAuthenticated, hasRedirected])

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <Spinner className="w-8 h-8 mb-4 mx-auto" />
          <p className="text-slate-400">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or wrong role - don't render children
  if (!isAuthenticated || !user || !hasRole(requiredRoles)) {
    return null
  }

  // User has correct role - render protected content
  return <>{children}</>
}
