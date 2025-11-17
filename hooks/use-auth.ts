'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api/client';

export function useAuth() {
  const auth0 = useAuth0();
  const { getAccessTokenSilently, isAuthenticated } = auth0;

  // Set token in API client when user is authenticated
  useEffect(() => {
    const updateToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
        } catch (error) {
          console.error('Error getting access token:', error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    };

    updateToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return auth0;
}
