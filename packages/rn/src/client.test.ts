import { LogtoClient } from './client';

const { platform, memoryStore, MemoryStorage, openBrowserAsync, openAuthSessionAsync } =
  vitest.hoisted(() => {
    const platform = { OS: 'web' };
    const memoryStore = new Map<string, string>();

    class MemoryStorage {
      constructor(public readonly appId: string) {}

      getKey(item?: string) {
        return item === undefined ? this.appId : `${this.appId}:${item}`;
      }

      async getItem(key: string) {
        return memoryStore.get(this.getKey(key)) ?? null;
      }

      async setItem(key: string, value: string) {
        memoryStore.set(this.getKey(key), value);
      }

      async removeItem(key: string) {
        memoryStore.delete(this.getKey(key));
      }
    }

    return {
      platform,
      memoryStore,
      MemoryStorage,
      openBrowserAsync: vitest.fn(async () => ({ type: 'opened' })),
      openAuthSessionAsync: vitest.fn(async () => ({ type: 'cancel' })),
    };
  });

vitest.mock('react-native', () => ({ Platform: platform }));

vitest.mock('expo-web-browser', () => ({ openBrowserAsync, openAuthSessionAsync }));

vitest.mock('./storage', () => ({ BrowserStorage: MemoryStorage, SecureStorage: MemoryStorage }));

vitest.mock('./utils', () => ({
  generateCodeChallenge: async () => 'code-challenge',
  generateRandomString: async () => 'random-string',
}));

const oidcConfig = {
  authorization_endpoint: 'https://logto.example.com/oidc/auth',
  token_endpoint: 'https://logto.example.com/oidc/token',
  userinfo_endpoint: 'https://logto.example.com/oidc/me',
  end_session_endpoint: 'https://logto.example.com/oidc/session/end',
  revocation_endpoint: 'https://logto.example.com/oidc/token/revocation',
  jwks_uri: 'https://logto.example.com/oidc/jwks',
  issuer: 'https://logto.example.com/oidc',
};

const config = { endpoint: 'https://logto.example.com', appId: 'app-id' };
const redirectUri = 'https://app.example.com/callback';

const createClient = () => new LogtoClient(config);

describe('LogtoClient sign-in popup handling', () => {
  beforeEach(() => {
    memoryStore.clear();
    openBrowserAsync.mockClear();
    openAuthSessionAsync.mockClear();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- reset the mocked platform between tests
    platform.OS = 'web';
    // Resolves the OIDC discovery request triggered by `super.signIn`.
    vitest.stubGlobal(
      'fetch',
      vitest.fn(async () => ({ ok: true, json: async () => oidcConfig }))
    );
  });

  afterEach(() => {
    vitest.unstubAllGlobals();
  });

  it('opens a named blank window before the auth session on web', async () => {
    // `openAuthSessionAsync` returns `cancel`, so sign-in throws after the window is opened.
    await expect(createClient().signIn(redirectUri)).rejects.toThrow();

    expect(openBrowserAsync).toHaveBeenCalledWith('', { windowName: 'logtoAuth' });
    expect(openAuthSessionAsync).toHaveBeenCalledWith(
      expect.any(String),
      redirectUri,
      expect.objectContaining({ windowName: 'logtoAuth' })
    );
    // The blank window must be opened while the click gesture is alive, i.e. before the auth session.
    expect(openBrowserAsync.mock.invocationCallOrder[0]).toBeLessThan(
      openAuthSessionAsync.mock.invocationCallOrder[0]!
    );
  });

  it('does not pre-open a window on native platforms', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- switch the mocked platform to native
    platform.OS = 'ios';

    await expect(createClient().signIn(redirectUri)).rejects.toThrow();

    expect(openBrowserAsync).not.toHaveBeenCalled();
    expect(openAuthSessionAsync).toHaveBeenCalledTimes(1);
  });

  it('opts out of the workaround when disableWebPopupWorkaround is set', async () => {
    const client = new LogtoClient({ ...config, disableWebPopupWorkaround: true });

    await expect(client.signIn(redirectUri)).rejects.toThrow();

    expect(openBrowserAsync).not.toHaveBeenCalled();
    // No reuse name is passed, so the auth session opens a fresh window as before the workaround.
    expect(openAuthSessionAsync).toHaveBeenCalledWith(
      expect.any(String),
      redirectUri,
      expect.not.objectContaining({ windowName: 'logtoAuth' })
    );
  });

  it('closes the pre-opened window when sign-in fails before the auth session', async () => {
    const close = vitest.fn();
    const open = vitest.fn(() => ({ close }));
    vitest.stubGlobal('window', { open });
    // Fail OIDC discovery so `super.signIn` rejects before `openAuthSessionAsync` runs.
    vitest.stubGlobal(
      'fetch',
      vitest.fn(async () => {
        throw new Error('network error');
      })
    );

    await expect(createClient().signIn(redirectUri)).rejects.toThrow('network error');

    expect(openBrowserAsync).toHaveBeenCalledWith('', { windowName: 'logtoAuth' });
    expect(openAuthSessionAsync).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith('', 'logtoAuth');
    expect(close).toHaveBeenCalledTimes(1);
  });
});
