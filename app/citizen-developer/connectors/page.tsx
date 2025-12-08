'use client';

import { useState } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Link as LinkIcon,
  Unlink,
  TestTube,
  Info,
} from 'lucide-react';
import {
  usePowerAppsStatus,
  useMendixStatus,
  useConnectPowerApps,
  useDisconnectPowerApps,
  useDisconnectMendix,
  useTestPowerApps,
  useTestMendix,
} from '@/hooks/use-connectors';
import { MendixConnectModal } from '@/components/connectors/mendix-connect-modal';
import type { ConnectionStatus } from '@/lib/types/connectors';

interface ConnectorCardProps {
  name: string;
  platform: 'powerapps' | 'mendix';
  description: string;
  status?: ConnectionStatus;
  lastConnected?: string;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onTest: () => void;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isTesting: boolean;
}

function ConnectorCard({
  name,
  platform,
  description,
  status,
  lastConnected,
  isLoading,
  onConnect,
  onDisconnect,
  onTest,
  isConnecting,
  isDisconnecting,
  isTesting,
}: ConnectorCardProps) {
  const getStatusDisplay = () => {
    if (isLoading) {
      return (
        <span className="inline-flex items-center gap-1 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </span>
      );
    }

    switch (status) {
      case 'CONNECTED':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'DISCONNECTED':
        return (
          <Badge variant="default" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            Not Connected
          </Badge>
        );
    }
  };

  const isConnected = status === 'CONNECTED';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{name}</h3>
              {getStatusDisplay()}
            </div>
            <p className="text-sm text-slate-400 mb-4">{description}</p>
            <div className="space-y-1 text-sm text-slate-500">
              {isLoading ? (
                <Skeleton className="h-4 w-48 bg-slate-700" />
              ) : (
                <>
                  {lastConnected && (
                    <p className="text-xs">Last connected: {new Date(lastConnected).toLocaleString()}</p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!isConnected ? (
              <Button
                onClick={onConnect}
                disabled={isConnecting || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect {platform === 'powerapps' ? 'PowerApps' : 'Mendix'}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onTest}
                  disabled={isTesting || isLoading}
                  className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onDisconnect}
                  disabled={isDisconnecting || isLoading}
                  className="border-red-600 text-red-400 bg-transparent hover:bg-red-950"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="w-4 h-4 mr-2" />
                      Disconnect
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CitizenDeveloperConnectorsPage() {
  const [isMendixModalOpen, setIsMendixModalOpen] = useState(false);

  // PowerApps hooks
  const { data: powerAppsStatus, isLoading: powerAppsLoading, refetch: refetchPowerApps } = usePowerAppsStatus();
  const { mutate: connectPowerApps, isPending: isConnectingPowerApps } = useConnectPowerApps();
  const { mutate: disconnectPowerApps, isPending: isDisconnectingPowerApps } = useDisconnectPowerApps();
  const { mutate: testPowerApps, isPending: isTestingPowerApps } = useTestPowerApps();

  // Mendix hooks
  const { data: mendixStatus, isLoading: mendixLoading, refetch: refetchMendix } = useMendixStatus();
  const { mutate: disconnectMendix, isPending: isDisconnectingMendix } = useDisconnectMendix();
  const { mutate: testMendix, isPending: isTestingMendix } = useTestMendix();

  const handleConnectPowerApps = () => {
    connectPowerApps(undefined, {
      onSuccess: (data) => {
        if (data.authorizationUrl) {
          // Redirect to PowerApps OAuth
          window.location.href = data.authorizationUrl;
        }
      },
    });
  };

  const handleConnectMendix = () => {
    setIsMendixModalOpen(true);
  };

  const handleDisconnectPowerApps = () => {
    disconnectPowerApps(undefined, {
      onSuccess: () => {
        refetchPowerApps();
      },
    });
  };

  const handleDisconnectMendix = () => {
    disconnectMendix(undefined, {
      onSuccess: () => {
        refetchMendix();
      },
    });
  };

  const handleTestPowerApps = () => {
    testPowerApps(undefined, {
      onSuccess: () => {
        refetchPowerApps();
      },
    });
  };

  const handleTestMendix = () => {
    testMendix(undefined, {
      onSuccess: () => {
        refetchMendix();
      },
    });
  };

  const navItems = [
    { label: 'My Sandbox', href: '/citizen-developer' },
    { label: 'My Changes', href: '/citizen-developer/changes' },
    { label: 'Request Review', href: '/citizen-developer/review' },
    { label: 'Connectors', href: '/citizen-developer/connectors' },
    { label: 'Learning Hub', href: '/citizen-developer/learning' },
  ];

  const hasAnyConnection = powerAppsStatus?.status === 'CONNECTED' || mendixStatus?.status === 'CONNECTED';

  return (
    <>
      <MainNav
        title="Citizen Developer Portal"
        navItems={navItems}
        userRole="Citizen Developer"
        userName="Sarah K."
        userInitials="SK"
      />

      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <PageHeader
          title="Platform Connectors"
          description="Connect your PowerApps or Mendix account to create sandboxes and sync your apps"
        />
      </div>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Info Alert */}
        <Alert className="mb-6 bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Why connect?</strong> You need to connect your platform account before you can create sandboxes
            and work with your apps. Your credentials are securely stored and only used to access your own applications.
          </AlertDescription>
        </Alert>

        {!hasAnyConnection && (
          <Alert className="mb-6 bg-yellow-900/30 border-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Action required:</strong> You need to connect at least one platform account to create sandboxes
              and start making changes.
            </AlertDescription>
          </Alert>
        )}

        {/* Connectors Grid */}
        <div className="space-y-4">
          <ConnectorCard
            name="Microsoft PowerApps"
            platform="powerapps"
            description="Connect to your Power Platform environment to create sandboxes and sync PowerApps applications."
            status={powerAppsStatus?.status}
            lastConnected={powerAppsStatus?.lastConnected}
            isLoading={powerAppsLoading}
            onConnect={handleConnectPowerApps}
            onDisconnect={handleDisconnectPowerApps}
            onTest={handleTestPowerApps}
            isConnecting={isConnectingPowerApps}
            isDisconnecting={isDisconnectingPowerApps}
            isTesting={isTestingPowerApps}
          />

          <ConnectorCard
            name="Mendix"
            platform="mendix"
            description="Connect to your Mendix account using a Personal Access Token to create sandboxes and sync Mendix applications."
            status={mendixStatus?.status}
            lastConnected={mendixStatus?.lastConnected}
            isLoading={mendixLoading}
            onConnect={handleConnectMendix}
            onDisconnect={handleDisconnectMendix}
            onTest={handleTestMendix}
            isConnecting={false}
            isDisconnecting={isDisconnectingMendix}
            isTesting={isTestingMendix}
          />
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                <strong className="text-slate-300">PowerApps:</strong> You'll be redirected to Microsoft to authorize
                access. Make sure you have the necessary permissions in your Power Platform environment.
              </p>
              <p>
                <strong className="text-slate-300">Mendix:</strong> You'll need a Personal Access Token (PAT) from your
                Mendix account. You can create one in your Mendix Profile settings.
              </p>
              <p className="pt-2 border-t border-slate-700">
                Once connected, you can return to the <strong>My Sandbox</strong> page to create a new sandbox and start
                making changes to your apps.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mendix Connect Modal */}
      <MendixConnectModal
        open={isMendixModalOpen}
        onOpenChange={setIsMendixModalOpen}
      />
    </>
  );
}
