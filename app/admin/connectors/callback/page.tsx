'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePowerAppsCallback } from '@/hooks/use-connectors';

export default function PowerAppsCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { mutate: handleCallback } = usePowerAppsCallback();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      setStatus('error');
      setErrorMessage(
        errorDescription || error || 'An error occurred during authorization'
      );
      return;
    }

    // Validate required parameters
    if (!code || !state) {
      setStatus('error');
      setErrorMessage('Missing required parameters. Please try connecting again.');
      return;
    }

    // Process the callback
    handleCallback(
      { code, state },
      {
        onSuccess: () => {
          setStatus('success');
          // Redirect to connectors page after 2 seconds
          setTimeout(() => {
            router.push('/admin/connectors');
          }, 2000);
        },
        onError: (err) => {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to complete connection');
        },
      }
    );
  }, [searchParams, handleCallback, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'processing' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Connecting PowerApps
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Connection Successful
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Connection Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === 'processing' && 'Please wait while we complete your PowerApps connection...'}
            {status === 'success' && 'Your PowerApps account has been connected successfully.'}
            {status === 'error' && 'We encountered an issue while connecting your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'processing' && (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-full animate-pulse bg-blue-600" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Verifying your credentials...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting you to the connectors page...
              </p>
              <Button onClick={() => router.push('/admin/connectors')} className="w-full">
                Go to Connectors
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/admin/connectors')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Connectors
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
