'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { getDefaultDashboard, user } = useAuth()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    const dashboard = getDefaultDashboard()
    router.push(dashboard)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Error Alert */}
        <Alert variant="destructive" className="bg-red-950 border-red-800">
          <ShieldAlert className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <h2 className="text-lg font-semibold mb-2 text-white">Access Denied</h2>
            <p className="text-red-200">
              You don't have permission to access this page. This area is restricted to users with specific roles.
            </p>
          </AlertDescription>
        </Alert>

        {/* User Info */}
        {user && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Current Role:</p>
            <p className="text-white font-medium">
              {user.role === 'ADMIN' && '👑 Administrator'}
              {user.role === 'PRO_DEVELOPER' && '💻 Professional Developer'}
              {user.role === 'CITIZEN_DEVELOPER' && '🎨 Citizen Developer'}
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Need Access?</h3>
          <p className="text-slate-400 text-sm">
            If you believe you should have access to this page, please contact your organization administrator to request the necessary permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGoBack} 
            variant="outline"
            className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={handleGoHome}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
