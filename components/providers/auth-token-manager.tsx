'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthToken } from '@/lib/api/client';

/**
 * Context to track if auth token is ready
 */
const AuthTokenContext = createContext<{ isTokenReady: boolean }>({
  isTokenReady: false,
});

export const useAuthToken = () => useContext(AuthTokenContext);

/**
 * Component that manages authentication token injection into axios
 * Must be used within Auth0Provider
 */
export function AuthTokenManager({ children }: { children?: React.ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    const updateToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          console.log('✅ Auth token set in API client');
          setIsTokenReady(true);
        } catch (error: any) {
          console.error('❌ Error getting access token:', error);
          
          // Check if error is due to consent required or login required
          if (error.error === 'consent_required' || error.error === 'login_required') {
            console.log('🔄 Session expired or consent required. User needs to re-authenticate.');
            setAuthToken(null);
            setIsTokenReady(true);
            // Let the app render so it can show login button or redirect
          } else {
            // Other errors
            console.error('Unexpected auth error:', error);
            setAuthToken(null);
            setIsTokenReady(true);
          }
        }
      } else if (!isAuthenticated && !isLoading) {
        setAuthToken(null);
        console.log('🔓 Auth token removed from API client');
        // Allow queries even without token (for public endpoints)
        setIsTokenReady(true);
      }
    };

    updateToken();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  if (children) {
    // Wait for token to be ready before rendering children
    if (!isTokenReady) {
      return (
        <AuthTokenContext.Provider value={{ isTokenReady }}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-sm text-muted-foreground">Initializing...</p>
            </div>
          </div>
        </AuthTokenContext.Provider>
      );
    }

    return (
      <AuthTokenContext.Provider value={{ isTokenReady }}>
        {children}
      </AuthTokenContext.Provider>
    );
  }

  return null; // Backward compatibility - doesn't render anything
}
