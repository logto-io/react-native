import BaseClient, { createRequester, LogtoConfig } from '@logto/client';

import { RNStorage } from './storage';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators';

export class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig, navigate: (url: string) => void) {
    super(config, {
      requester: createRequester(fetch),
      navigate,
      storage: new RNStorage(),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
