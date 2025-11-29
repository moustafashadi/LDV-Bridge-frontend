import { useCurrentUser } from './use-users'
import type { User } from '../api/users-api'

export type UserRole = 'ADMIN' | 'PRO_DEVELOPER' | 'CITIZEN_DEVELOPER'

/**
 * Authentication and Authorization Hook
 * Provides role-based access control utilities
 */
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser()

  const isAuthenticated = !!user && !error
  const isAdmin = user?.role === 'ADMIN'
  const isProDeveloper = user?.role === 'PRO_DEVELOPER'
  const isCitizenDeveloper = user?.role === 'CITIZEN_DEVELOPER'

  /**
   * Check if user has any of the specified roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role as UserRole)
  }

  /**
   * Check if user has permission to access admin features
   */
  const canAccessAdmin = (): boolean => {
    return isAdmin
  }

  /**
   * Check if user has permission to access pro developer features
   */
  const canAccessProDeveloper = (): boolean => {
    return isAdmin || isProDeveloper
  }

  /**
   * Check if user has permission to access citizen developer features
   */
  const canAccessCitizenDeveloper = (): boolean => {
    return isAdmin || isCitizenDeveloper
  }

  /**
   * Get the default dashboard route based on user role
   */
  const getDefaultDashboard = (): string => {
    if (!user?.role) return '/auth/login'
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/users'
      case 'PRO_DEVELOPER':
        return '/pro-developer'
      case 'CITIZEN_DEVELOPER':
        return '/citizen-developer'
      default:
        return '/dashboard'
    }
  }

  return {
    // User data
    user,
    isLoading,
    error,
    
    // Authentication state
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isProDeveloper,
    isCitizenDeveloper,
    
    // Permission checks
    hasRole,
    canAccessAdmin,
    canAccessProDeveloper,
    canAccessCitizenDeveloper,
    
    // Navigation
    getDefaultDashboard,
  }
}
