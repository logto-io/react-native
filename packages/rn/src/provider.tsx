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

  useEffect(() => {
    (async () => {
      const isAuthenticated = await memorizedLogtoClient.isAuthenticated();

      setIsAuthenticated(isAuthenticated);
    })();
  }, [memorizedLogtoClient]);

  const memorizedContextValue = useMemo(
    () => ({
      client: memorizedLogtoClient,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [memorizedLogtoClient, isAuthenticated]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
