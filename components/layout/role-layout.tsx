"use client"

import { usePathname } from "next/navigation"
import { MainNav } from "./main-nav"
import { getRoleFromPath, getNavigationForRole, type UserRole } from "@/lib/navigation"

interface RoleLayoutProps {
  children: React.ReactNode
  /**
   * Override the role detection (useful for testing or explicit role setting)
   */
  role?: UserRole
  /**
   * User information
   */
  userName?: string
  userInitials?: string
  notificationCount?: number
}

/**
 * RoleLayout - Provides consistent navigation based on user role
 * 
 * This component ensures that navigation remains consistent across all pages
 * within a role. The navigation menu is determined by the user's role, not by
 * the current page, ensuring a predictable and consistent user experience.
 * 
 * Usage:
 * ```tsx
 * <RoleLayout>
 *   <YourPageContent />
 * </RoleLayout>
 * ```
 * 
 * The role is automatically detected from the URL path, but can be overridden
 * via the `role` prop if needed.
 */
export function RoleLayout({ 
  children, 
  role: explicitRole,
  userName = "User",
  userInitials = "U",
  notificationCount = 0
}: RoleLayoutProps) {
  const pathname = usePathname()
  
  // Determine role from path or use explicit role
  const role = explicitRole || getRoleFromPath(pathname)
  
  if (!role) {
    // No role detected - render without navigation (e.g., login page)
    return <>{children}</>
  }
  
  const navConfig = getNavigationForRole(role)
  
  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav
        title="LDV Bridge"
        navItems={navConfig.navItems}
        userRole={navConfig.roleLabel}
        userName={userName}
        userInitials={userInitials}
        notificationCount={notificationCount}
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
