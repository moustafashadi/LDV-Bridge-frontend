/**
 * Get the appropriate redirect path based on user role
 */
export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PRO_DEVELOPER':
      return '/pro-developer';
    case 'CITIZEN_DEVELOPER':
      return '/citizen-developer';
    default:
      return '/onboarding';
  }
}
