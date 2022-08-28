import type { LogtoConfig } from '@logto/client';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';

import { LogtoContext } from './context';
import { LogtoClient } from './logto';

export type LogtoProviderProps = {
  config: LogtoConfig;
  children?: ReactNode;
};

export const LogtoProvider = ({ config, children }: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string>();
  const memorizedLogtoClient = useMemo(() => ({ logtoClient: new LogtoClient(config, (url) => {
    setWebViewUrl(url);
    setShowWebView(true);
  }) }), [config]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    (async () => {
      const isAuthenticated = await memorizedLogtoClient.logtoClient.isAuthenticated();

      setIsAuthenticated(isAuthenticated);
    })();
  }, [memorizedLogtoClient]);

  const memorizedContextValue = useMemo(
    () => ({
      ...memorizedLogtoClient,
      isAuthenticated,
      setIsAuthenticated,
      loadingCount,
      setLoadingCount,
      error,
      setError,
    }),
    [memorizedLogtoClient, isAuthenticated, loadingCount, error]
  );

  return (
    <LogtoContext.Provider value={memorizedContextValue}>
      {showWebView ? <WebView source={{ uri: webViewUrl, html: '' }} /> : children}
    </LogtoContext.Provider>
  );
};
