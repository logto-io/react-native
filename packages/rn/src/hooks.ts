import { useCallback, useContext, useMemo } from 'react';

import { LogtoContext } from './context';

export const useLogto = () => {
  const { client, isAuthenticated, setIsAuthenticated } = useContext(LogtoContext);

  const signIn = useCallback(
    async (redirectUri: string) => {
      await client.signIn(redirectUri);
      setIsAuthenticated(true);
    },
    [client, setIsAuthenticated]
  );
  const signOut = useCallback(
    async (redirectUri?: string) => {
      await client.signOut(redirectUri);
      setIsAuthenticated(false);
    },
    [client, setIsAuthenticated]
  );

  const memorized = useMemo(
    () => ({
      client,
      isAuthenticated,
      getRefreshToken: client.getRefreshToken.bind(client),
      getAccessToken: client.getAccessToken.bind(client),
      getAccessTokenClaims: client.getAccessTokenClaims.bind(client),
      getOrganizationToken: client.getOrganizationToken.bind(client),
      getOrganizationTokenClaims: client.getOrganizationTokenClaims.bind(client),
      getIdToken: client.getIdToken.bind(client),
      getIdTokenClaims: client.getIdTokenClaims.bind(client),
      signIn,
      signOut,
      fetchUserInfo: client.fetchUserInfo.bind(client),
    }),
    [client, isAuthenticated, signIn, signOut]
  );

  return memorized;
};
