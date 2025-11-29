import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware for Route Protection
 * 
 * TEMPORARILY DISABLED to avoid redirect loops during development
 * Role-based protection is handled by ProtectedRoute component in pages
 */

export function middleware(request: NextRequest) {
  // Let everything through for now
  // The ProtectedRoute component will handle authorization
  return NextResponse.next()
}

export const config = {
  // Only match role-specific routes
  matcher: [
    '/admin/:path*',
    '/pro-developer/:path*',
    '/citizen-developer/:path*',
  ],
}
