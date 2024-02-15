import { createContext } from 'react';

import type { LogtoClient } from './client';

export type LogtoContextProps = {
  client: LogtoClient;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LogtoProvider> context.');
};

export const LogtoContext = createContext<LogtoContextProps>({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  client: undefined!,
  isAuthenticated: false,
  setIsAuthenticated: throwContextError,
});
