import {
  LogtoError,
  Prompt,
  StandardLogtoClient,
  createRequester,
  type SignInOptions,
  type InteractionMode,
  type LogtoConfig,
} from '@logto/client';
import { decodeIdToken } from '@logto/js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { LogtoNativeClientError } from './errors';
import { BrowserStorage, SecureStorage } from './storage';
import { generateCodeChallenge, generateRandomString } from './utils';

const issuedAtTimeTolerance = 300; // 5 minutes

// On web, the sign-in window is opened by name so a pre-opened blank popup can be reused.
// See `signIn` below for why this is needed.
const webAuthWindowName = 'logtoAuth';

export type LogtoNativeConfig = LogtoConfig & {
  /**
   * The prompt to be used for the authentication request. This can be used to skip the login or
   * consent screen when the user has already granted the required permissions.
   *
   * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest | OpenID Connect Core 1.0}
   * @default [Prompt.Login, Prompt.Consent]
   */
  prompt?: Prompt | Prompt[];
  /**
   * **Only for iOS**
   *
   * Determines whether the session should ask the browser for a private authentication session.
   * Set this to true to request that the browser doesn’t share cookies or other browsing data
   * between the authentication session and the user’s normal browser session. Whether the request
   * is honored depends on the user’s default web browser.
   *
   * @default true
   */
  preferEphemeralSession?: boolean;
  /**
   * **Only for web**
   *
   * On web, the sign-in flow opens the authorization window via `window.open`. Because the URL is
   * only known after async work (OIDC discovery, PKCE), Safari and Firefox no longer treat the call
   * as user-initiated and block it as a popup. To work around this, the SDK opens a blank window
   * synchronously when sign-in starts and reuses it for the authorization request.
   *
   * Set this to `true` to opt out of the workaround and fall back to opening the window directly,
   * e.g. if it conflicts with your own popup handling. Has no effect on native platforms.
   *
   * @default false
   */
  disableWebPopupWorkaround?: boolean;
};

export class LogtoClient extends StandardLogtoClient {
  authSessionResult?: WebBrowser.WebBrowserAuthSessionResult;
  protected storage: SecureStorage | BrowserStorage;
  protected readonly webPopupWorkaroundEnabled: boolean;

  constructor(config: LogtoNativeConfig) {
    const storage =
      Platform.OS === 'web'
        ? new BrowserStorage(config.appId)
        : new SecureStorage(`logto.${config.appId}`);

    const requester = createRequester(fetch);
    const webPopupWorkaroundEnabled = !(config.disableWebPopupWorkaround ?? false);

    super(
      { prompt: [Prompt.Consent], ...config },
      {
        requester,
        navigate: async (url: string, { redirectUri, for: purpose }) => {
          switch (purpose) {
            case 'sign-in': {
              this.authSessionResult = undefined;
              this.authSessionResult = await WebBrowser.openAuthSessionAsync(url, redirectUri, {
                preferEphemeralSession: config.preferEphemeralSession ?? true,
                createTask: false,
                // Reuse the popup pre-opened in `signIn` on web; `undefined` (the default) when the
                // workaround is off, and ignored on native.
                windowName: webPopupWorkaroundEnabled ? webAuthWindowName : undefined,
              });
              break;
            }
            case 'sign-out': {
              break;
            }
            default: {
              throw new LogtoNativeClientError('navigation_purpose_not_supported');
            }
          }
        },
        storage,
        generateCodeChallenge,
        generateCodeVerifier: generateRandomString,
        generateState: generateRandomString,
      },
      (client) => ({
        // Due to the limitation of Expo, we could not verify JWT signature on the client side.
        // Thus we only decode the token and verify the claims here. The signature verification
        // may be done on the server side or in the future when the limitation is resolved.
        //
        // Limitations:
        // - Lack of support for the crypto module or Web Crypto API.
        // - Lack of support for native modules in the managed workflow.
        verifyIdToken: async (idToken: string) => {
          const { issuer } = await client.getOidcConfig();
          const claims = decodeIdToken(idToken);

          if (Math.abs(claims.iat - Date.now() / 1000) > issuedAtTimeTolerance) {
            throw new LogtoError('id_token.invalid_iat');
          }

          if (claims.aud !== client.logtoConfig.appId || claims.iss !== issuer) {
            throw new LogtoError('id_token.invalid_token');
          }
        },
      })
    );

    this.storage = storage;
    this.webPopupWorkaroundEnabled = webPopupWorkaroundEnabled;
  }

  /**
   * Start the sign-in flow with the specified redirect URI. The URI must be registered in the
   * Logto Console. It uses `WebBrowser.openAuthSessionAsync` to open the browser and start the
   * sign-in flow.
   *
   * The user will be redirected to that URI after the sign-in flow is completed, and the client
   * will handle the callback to exchange the authorization code for the tokens.
   *
   * @param options The options for the sign-in flow.
   *
   * @see {@link SignInOptions}
   */
  override async signIn(options: SignInOptions): Promise<void>;
  /**
   * Start the sign-in flow with the specified redirect URI. The URI must be registered in the
   * Logto Console. It uses `WebBrowser.openAuthSessionAsync` to open the browser and start the
   * sign-in flow.
   *
   * The user will be redirected to that URI after the sign-in flow is completed, and the client
   * will handle the callback to exchange the authorization code for the tokens.
   *
   * @param redirectUri The redirect URI that the user will be redirected to after the sign-in flow is completed.
   * @param interactionMode The interaction mode to be used for the authorization request. Note it's not
   * a part of the OIDC standard, but a Logto-specific extension. Defaults to `signIn`.
   *
   * @see {@link InteractionMode}
   */
  override async signIn(redirectUri: string, interactionMode?: InteractionMode): Promise<void>;
  override async signIn(
    options: SignInOptions | string,
    interactionMode?: InteractionMode
  ): Promise<void> {
    const usePopupWorkaround = Platform.OS === 'web' && this.webPopupWorkaroundEnabled;

    if (usePopupWorkaround) {
      // `super.signIn` awaits OIDC config, PKCE and storage before opening the auth window, by
      // which point the click's user activation is gone and Safari blocks the popup. Open a named
      // blank window now, while the activation is still alive; `openAuthSessionAsync` later reuses
      // it by name, which the browser treats as a navigation rather than a new popup.
      await WebBrowser.openBrowserAsync('', { windowName: webAuthWindowName });
    }

    try {
      await (typeof options === 'string'
        ? super.signIn(options, interactionMode)
        : super.signIn(options));
    } catch (error: unknown) {
      if (usePopupWorkaround) {
        // Re-target the named window (empty URL doesn't navigate it) and close it, so a sign-in
        // that fails before the auth window opens doesn't leave a blank popup behind.
        window.open('', webAuthWindowName)?.close();
      }
      throw error;
    }

    if (this.authSessionResult?.type !== 'success') {
      throw new LogtoNativeClientError('auth_session_failed');
    }

    await this.handleSignInCallback(this.authSessionResult.url);
  }

  /**
   * Revokes all the tokens and cleans up the storage. By default, it will NOT open the browser
   * to start the sign-out flow for better user experience, and the `postLogoutRedirectUri` will
   * be ignored.
   */
  override async signOut(postLogoutRedirectUri?: string | undefined): Promise<void> {
    return super.signOut(postLogoutRedirectUri);
  }
}
