'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthToken } from '@/lib/api/client';

/**
 * Component that manages authentication token injection into axios
 * Must be used within Auth0Provider
 */
export function AuthTokenManager() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    const updateToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          console.log('✅ Auth token set in API client');
        } catch (error) {
          console.error('❌ Error getting access token:', error);
          setAuthToken(null);
        }
      } else if (!isAuthenticated && !isLoading) {
        setAuthToken(null);
        console.log('🔓 Auth token removed from API client');
      }
    };

    updateToken();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return null; // This component doesn't render anything
}
