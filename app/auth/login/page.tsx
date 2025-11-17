'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to role-specific dashboard
    if (isAuthenticated) {
      window.location.href = '/onboarding';
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to LDV-Bridge</h1>
          <p className="text-muted-foreground">
            Governance and version control for low-code/no-code applications
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => loginWithRedirect()}
            className="w-full"
            size="lg"
          >
            Sign In / Sign Up
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <h3 className="font-semibold text-sm">Why LDV-Bridge?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Centralized governance for your low-code apps</li>
            <li>✓ Version control and change tracking</li>
            <li>✓ Review workflows and approvals</li>
            <li>✓ Sandbox environments for testing</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
