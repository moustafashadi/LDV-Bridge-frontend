'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'

/**
 * Admin Page Wrapper
 * Automatically wraps admin pages with ADMIN role protection
 */
export function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

/**
 * Pro Developer Page Wrapper  
 * Allows ADMIN and PRO_DEVELOPER roles
 */
export function ProDeveloperPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'PRO_DEVELOPER']}>
      {children}
    </ProtectedRoute>
  )
}

/**
 * Citizen Developer Page Wrapper
 * Allows ADMIN and CITIZEN_DEVELOPER roles
 */
export function CitizenDeveloperPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'CITIZEN_DEVELOPER']}>
      {children}
    </ProtectedRoute>
  )
}
