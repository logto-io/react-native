import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { LogtoClient, type LogtoNativeConfig } from './client.js';
import { LogtoContext } from './context.js';

export type LogtoProviderProps = {
  /** The configuration for the `LogtoClient`. */
  readonly config: LogtoNativeConfig;
  readonly children?: ReactNode;
};

/**
 * A provider component to provide the `LogtoContext` which includes the `LogtoClient` instance
 * with the given configuration.
 */
export const LogtoProvider = ({ config, children }: LogtoProviderProps) => {
  const memorizedLogtoClient = useMemo(() => new LogtoClient(config), [config]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const isAuthenticated = await memorizedLogtoClient.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      // Mark the client as initialized.
      setIsInitialized(true);
    })();
  }, [memorizedLogtoClient]);

  const memorizedContextValue = useMemo(
    () => ({
      client: memorizedLogtoClient,
      isAuthenticated,
      isInitialized,
      setIsAuthenticated,
    }),
    [memorizedLogtoClient, isAuthenticated, isInitialized]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
