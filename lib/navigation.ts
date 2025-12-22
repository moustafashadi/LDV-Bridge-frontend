/**
 * Centralized Navigation Configuration
 *
 * This file defines role-based navigation menus that remain consistent
 * across all pages within a role. The active page is highlighted, but
 * all menu items are always visible.
 */

export type UserRole = "admin" | "citizen-developer" | "pro-developer";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface RoleNavigation {
  role: UserRole;
  roleLabel: string;
  defaultPath: string;
  navItems: NavItem[];
}

/**
 * Navigation configuration for each user role.
 * These menus are STATIC and should appear on every page for the role.
 */
export const ROLE_NAVIGATION: Record<UserRole, RoleNavigation> = {
  admin: {
    role: "admin",
    roleLabel: "Administrator",
    defaultPath: "/admin",
    navItems: [
      {
        label: "Dashboard",
        href: "/admin",
        description: "Overview and analytics",
      },
      {
        label: "Policies",
        href: "/admin/policies",
        description: "Manage governance policies",
      },
      {
        label: "Connectors",
        href: "/admin/connectors",
        description: "Platform integrations",
      },
      { label: "Users", href: "/admin/users", description: "User management" },
      {
        label: "Sandboxes",
        href: "/admin/sandboxes",
        description: "Manage sandboxes",
      },
      {
        label: "Compliance",
        href: "/admin/compliance",
        description: "Compliance reports",
      },
    ],
  },
  "citizen-developer": {
    role: "citizen-developer",
    roleLabel: "Citizen Developer",
    defaultPath: "/citizen-developer",
    navItems: [
      {
        label: "My Workspace",
        href: "/citizen-developer",
        description: "Build and test apps",
      },
      {
        label: "My Changes",
        href: "/citizen-developer/changes",
        description: "Track my changes",
      },
      {
        label: "Request Review",
        href: "/citizen-developer/review",
        description: "Review requests",
      },
      {
        label: "Connectors",
        href: "/citizen-developer/connectors",
        description: "Platform connections",
      },
      {
        label: "Learning Hub",
        href: "/citizen-developer/learning",
        description: "Tutorials and resources",
      },
    ],
  },
  "pro-developer": {
    role: "pro-developer",
    roleLabel: "Pro Developer",
    defaultPath: "/pro-developer",
    navItems: [
      {
        label: "Review Queue",
        href: "/pro-developer",
        description: "Review queue and metrics",
      },
      {
        label: "Review",
        href: "/pro-developer/review",
        description: "Review submissions",
      },
      {
        label: "Change History",
        href: "/pro-developer/history",
        description: "Change history",
      },
      {
        label: "CI/CD Pipelines",
        href: "/pro-developer/pipelines",
        description: "CI/CD pipelines",
      },
      {
        label: "Audit Logs",
        href: "/pro-developer/audit",
        description: "Audit logs",
      },
    ],
  },
};

/**
 * Get navigation configuration for a specific role
 */
export function getNavigationForRole(role: UserRole): RoleNavigation {
  return ROLE_NAVIGATION[role];
}

/**
 * Determine if a path belongs to a specific role
 */
export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/citizen-developer")) return "citizen-developer";
  if (pathname.startsWith("/pro-developer")) return "pro-developer";
  return null;
}

/**
 * Check if a specific path is active (handles exact match and sub-routes)
 */
export function isPathActive(
  currentPath: string,
  navItemPath: string
): boolean {
  // Exact match
  if (currentPath === navItemPath) return true;

  // For non-root paths, check if current path starts with nav item path
  // But exclude root paths matching sub-paths (e.g., /admin shouldn't match /admin/policies)
  if (
    navItemPath !== "/admin" &&
    navItemPath !== "/citizen-developer" &&
    navItemPath !== "/pro-developer"
  ) {
    return currentPath.startsWith(navItemPath);
  }

  return false;
}
