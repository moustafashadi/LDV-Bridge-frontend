'use client';

import { useState } from 'react';
import { RoleLayout } from '@/components/layout/role-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Link as LinkIcon,
  Unlink,
  TestTube,
  RefreshCw,
  Settings,
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
            Disconnected
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
            Unknown
          </Badge>
        );
    }
  };

  const isConnected = status === 'CONNECTED';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-white">{name}</h3>
              {getStatusDisplay()}
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-48 bg-slate-700" />
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                </>
              ) : (
                <>
                  <p>
                    Status:{' '}
                    {isConnected
                      ? 'Ready to sync applications'
                      : 'Not connected - Click connect to authorize'}
                  </p>
                  {lastConnected && <p>Last connected: {new Date(lastConnected).toLocaleString()}</p>}
                  <p className="text-xs text-slate-500">Platform: {platform.toUpperCase()}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {!isConnected ? (
              <Button
                size="sm"
                onClick={onConnect}
                disabled={isConnecting || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onTest}
                  disabled={isTesting || isLoading}
                  className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.location.href = `/admin/connectors/${platform}`;
                  }}
                  className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  View Apps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDisconnect}
                  disabled={isDisconnecting || isLoading}
                  className="border-red-600 text-red-400 bg-transparent hover:bg-red-950"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="w-4 h-4 mr-1" />
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

export default function PlatformConnectors() {
  const [mendixModalOpen, setMendixModalOpen] = useState(false);

  // PowerApps
  const { data: powerAppsStatus, isLoading: powerAppsLoading, refetch: refetchPowerApps } = usePowerAppsStatus();
  const { mutate: connectPowerApps, isPending: powerAppsConnecting } = useConnectPowerApps();
  const { mutate: disconnectPowerApps, isPending: powerAppsDisconnecting } = useDisconnectPowerApps();
  const { mutate: testPowerApps, isPending: powerAppsTesting } = useTestPowerApps();

  // Mendix
  const { data: mendixStatus, isLoading: mendixLoading, refetch: refetchMendix } = useMendixStatus();
  const { mutate: disconnectMendix, isPending: mendixDisconnecting } = useDisconnectMendix();
  const { mutate: testMendix, isPending: mendixTesting } = useTestMendix();

  const handleRefreshAll = () => {
    refetchPowerApps();
    refetchMendix();
  };

  return (
    <RoleLayout>
      <PageHeader
        title="Platform Connectors"
        actions={
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* LCNC Connectors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">LCNC Platform Connectors</h2>
              <p className="text-sm text-slate-400">
                Manage connections to low-code/no-code platforms
              </p>
            </div>
            <div className="space-y-4">
              <ConnectorCard
                name="Microsoft PowerApps"
                platform="powerapps"
                status={powerAppsStatus?.status}
                lastConnected={powerAppsStatus?.lastConnected}
                isLoading={powerAppsLoading}
                onConnect={() => connectPowerApps()}
                onDisconnect={() => disconnectPowerApps()}
                onTest={() => testPowerApps()}
                isConnecting={powerAppsConnecting}
                isDisconnecting={powerAppsDisconnecting}
                isTesting={powerAppsTesting}
              />

              <ConnectorCard
                name="Mendix"
                platform="mendix"
                status={mendixStatus?.status}
                lastConnected={mendixStatus?.lastConnected}
                isLoading={mendixLoading}
                onConnect={() => setMendixModalOpen(true)}
                onDisconnect={() => disconnectMendix()}
                onTest={() => testMendix()}
                isConnecting={false}
                isDisconnecting={mendixDisconnecting}
                isTesting={mendixTesting}
              />
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-950/30 border-blue-800">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">About Platform Connectors</h3>
                  <p className="text-sm text-slate-300">
                    Platform connectors enable LDV-Bridge to synchronize applications from external
                    low-code/no-code platforms. Each connector uses secure OAuth or API key authentication
                    to access your applications. Your credentials are encrypted and stored securely.
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                    <li>
                      <strong>PowerApps:</strong> Uses Microsoft OAuth 2.0 for secure authorization
                    </li>
                    <li>
                      <strong>Mendix:</strong> Uses Personal Access Tokens (PAT) for API authentication
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mendix Connection Modal */}
      <MendixConnectModal open={mendixModalOpen} onOpenChange={setMendixModalOpen} />
    </RoleLayout>
  );
}
