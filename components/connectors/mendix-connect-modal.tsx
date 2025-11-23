'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, Info } from 'lucide-react';
import { useConnectMendix, useMendixInstructions } from '@/hooks/use-connectors';

interface MendixConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MendixConnectModal({ open, onOpenChange }: MendixConnectModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const { mutate: connect, isPending } = useConnectMendix();
  const { data: instructions } = useMendixInstructions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim() || !username.trim()) {
      return;
    }

    connect(
      { apiKey: apiKey.trim(), username: username.trim() },
      {
        onSuccess: () => {
          // Reset form and close modal
          setApiKey('');
          setUsername('');
          setShowInstructions(false);
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setApiKey('');
    setUsername('');
    setShowInstructions(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect Mendix Account</DialogTitle>
          <DialogDescription>
            Enter your Mendix Personal Access Token (PAT) to connect your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instructions Toggle */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Info className="mr-2 h-4 w-4" />
              {showInstructions ? 'Hide' : 'Show'} setup instructions
            </Button>
            <a
              href="https://docs.mendix.com/apidocs-mxsdk/apidocs/authentication/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              Mendix API Docs
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>

          {/* Setup Instructions */}
          {showInstructions && instructions && (
            <Alert>
              <AlertDescription className="space-y-2">
                <p className="font-semibold">How to generate a Personal Access Token:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <p className="text-sm mt-2">
                  <strong>Token URL:</strong>{' '}
                  <a
                    href={instructions.tokenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {instructions.tokenUrl}
                  </a>
                </p>
                {instructions.scopes && instructions.scopes.length > 0 && (
                  <p className="text-sm">
                    <strong>Required scopes:</strong> {instructions.scopes.join(', ')}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Mendix Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="your.email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isPending}
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              The email address associated with your Mendix account
            </p>
          </div>

          {/* API Key Field */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              Personal Access Token (PAT) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="mxpat-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              disabled={isPending}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Your token will be securely encrypted and stored
            </p>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Security:</strong> Your credentials are encrypted using AES-256 encryption before
              being stored. They are never shared with third parties and are only used to authenticate
              with Mendix APIs on your behalf.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !apiKey.trim() || !username.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
