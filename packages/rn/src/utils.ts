import * as Crypto from 'expo-crypto';
import { fromUint8Array } from 'js-base64';

export const generateRandomString = async (byteLength = 64) =>
  fromUint8Array(await Crypto.getRandomBytesAsync(byteLength), true);

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encodedCodeVerifier = new TextEncoder().encode(codeVerifier);
  const codeChallenge = new Uint8Array(
    await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, encodedCodeVerifier)
  );
  return fromUint8Array(codeChallenge, true);
};
