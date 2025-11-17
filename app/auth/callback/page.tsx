'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { onboardingApi } from '@/lib/api';
import { getRoleBasedRedirect } from '@/lib/redirect-utils';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push('/auth/login');
        return;
      }

      try {
        // Get access token
        const token = await getAccessTokenSilently();
        
        // Check onboarding status
        const { data: status } = await onboardingApi.getStatus();

        if (status.onboarded) {
          // User is fully onboarded
          if (status.status === 'ACTIVE' && status.role) {
            router.push(getRoleBasedRedirect(status.role));
          } else if (status.status === 'pending_approval') {
            router.push('/pending-approval');
          } else if (status.role) {
            router.push(getRoleBasedRedirect(status.role));
          } else {
            router.push('/onboarding');
          }
        } else {
          // User needs onboarding
          router.push('/onboarding');
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.response?.data?.message || 'An error occurred during authentication');
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, router, getAccessTokenSilently]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-destructive text-xl">⚠️</div>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
