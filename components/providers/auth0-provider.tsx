'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;
const redirectUri = process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export function Auth0ProviderWithNavigate({ children }: Auth0ProviderWithNavigateProps) {
  const router = useRouter();

  const onRedirectCallback = (appState?: any) => {
    router.push(appState?.returnTo || '/onboarding');
  };

  if (!domain || !clientId) {
    console.error('Auth0 configuration is missing. Please check your .env.local file.');
    return <div>Auth0 configuration error. Please contact support.</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience && { audience }),
        scope: 'openid profile email',
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={false}
    >
      {children}
    </Auth0Provider>
  );
}
