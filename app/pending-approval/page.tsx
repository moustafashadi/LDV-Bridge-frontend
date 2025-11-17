'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { onboardingApi } from '@/lib/api';
import { getRoleBasedRedirect } from '@/lib/redirect-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await onboardingApi.getStatus();
        setStatus(data);

        // If user is now active, redirect based on their role
        if (data.onboarded && data.status === 'ACTIVE' && data.role) {
          router.push(getRoleBasedRedirect(data.role));
        }
      } catch (err) {
        console.error('Error checking status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkStatus();
      // Poll every 30 seconds
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, router]);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin + '/auth/login',
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <CardTitle className="text-2xl">Your Request is Pending</CardTitle>
          <CardDescription>
            We've sent your request to the organization administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              You'll receive access once an administrator approves your request.
              We'll automatically check for updates every 30 seconds.
            </AlertDescription>
          </Alert>

          {status?.pendingRequests && status.pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your Pending Requests</h3>
              {status.pendingRequests.map((request: any) => (
                <Card key={request.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{request.organizationName}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requested as: <span className="font-medium">{request.requestedRole.replace('_', ' ')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="pt-6 border-t space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>An organization administrator will review your request</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>They may approve you with the role you requested or assign a different role</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Once approved, you'll automatically gain access to the platform</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>You can close this page - we'll send you an email when you're approved</span>
              </li>
            </ol>
          </div>

          <div className="pt-6 border-t">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
