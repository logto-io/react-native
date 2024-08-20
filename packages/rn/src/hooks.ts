import { maybeCompleteAuthSession } from 'expo-web-browser';
import { useCallback, useContext, useEffect, useMemo } from 'react';

// eslint-disable-next-line unused-imports/no-unused-imports -- use for JSDoc
import type { LogtoClient } from './client';
import { LogtoContext } from './context';

/**
 * A hook to use the Logto client instance, methods, and the authentication state. The
 * `LogtoContext` must be provided to make this hook work. It's recommended to use the
 * `LogtoProvider` component to wrap the root component of the app.
 */
export const useLogto = () => {
  const { client, isAuthenticated, setIsAuthenticated, isInitialized } = useContext(LogtoContext);

  useEffect(() => {
    // This is required to handle the redirect from the browser on a web-based expo app
    // @see {@link https://docs.expo.dev/versions/latest/sdk/webbrowser/#webbrowsermaybecompleteauthsessionoptions}
    maybeCompleteAuthSession();
  }, []);

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
      /** The Logto client instance. */
      client,
      /**
       * If the user is authenticated.
       *
       * NOTE: It only checks the existence of ID token in the storage, so it's not guaranteed that the
       * tokens are valid.
       */
      isAuthenticated,
      /**
       * Indicates if the client is initialized and the authentication state is retrieved from the storage.
       */
      isInitialized,
      /** @see {@link LogtoClient.getRefreshToken} */
      getRefreshToken: client.getRefreshToken.bind(client),
      /** @see {@link LogtoClient.getAccessToken} */
      getAccessToken: client.getAccessToken.bind(client),
      /** @see {@link LogtoClient.getAccessTokenClaims} */
      getAccessTokenClaims: client.getAccessTokenClaims.bind(client),
      /** @see {@link LogtoClient.getOrganizationToken} */
      getOrganizationToken: client.getOrganizationToken.bind(client),
      /** @see {@link LogtoClient.getOrganizationTokenClaims} */
      getOrganizationTokenClaims: client.getOrganizationTokenClaims.bind(client),
      /** @see {@link LogtoClient.getIdToken} */
      getIdToken: client.getIdToken.bind(client),
      /** @see {@link LogtoClient.getIdTokenClaims} */
      getIdTokenClaims: client.getIdTokenClaims.bind(client),
      /** @see {@link LogtoClient.signIn} */
      signIn,
      /** @see {@link LogtoClient.signOut} */
      signOut,
      /** @see {@link LogtoClient.fetchUserInfo} */
      fetchUserInfo: client.fetchUserInfo.bind(client),
    }),
    [client, isAuthenticated, isInitialized, signIn, signOut]
  );

  return memorized;
};
