/** @link [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) */
import { TextEncoder } from 'fastestsmallesttextencoderdecoder';
import { LogtoError } from '@logto/client';
import { Crypto } from '@peculiar/webcrypto';
import { fromUint8Array } from 'js-base64';

/**
 * @param length The length of the raw random data.
 */
const generateRandomString = (length = 64) => {
  const crypto = new Crypto();

  return fromUint8Array(crypto.getRandomValues(new Uint8Array(length)), true);
}

/**
 * Generates random string for state and encodes them in url safe base64
 */
export const generateState = () => generateRandomString();

/**
 * Generates code verifier
 *
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const generateCodeVerifier = () => generateRandomString();

/**
 * Calculates the S256 PKCE code challenge for an arbitrary code verifier and encodes it in url safe base64
 *
 * @param {String} codeVerifier Code verifier to calculate the S256 code challenge for
 * @link [Client Creates the Code Challenge](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2)
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const crypto = new Crypto();
  
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (crypto.subtle === undefined) {
    /**
     * `crypto.subtle` is available only in secure contexts (HTTPS) in some or all supporting browsers,
     * https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle
     * https://www.chromium.org/blink/webcrypto/#accessing-it
     */
    throw new LogtoError('crypto_subtle_unavailable');
  }

  const encodedCodeVerifier = new TextEncoder().encode(codeVerifier);
  const codeChallenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encodedCodeVerifier));

  return fromUint8Array(codeChallenge, true);
};
