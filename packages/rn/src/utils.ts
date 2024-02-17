import * as Crypto from 'expo-crypto';
import { encode, fromUint8Array, toUint8Array } from 'js-base64';

export const generateRandomString = async (byteLength = 64) =>
  fromUint8Array(await Crypto.getRandomBytesAsync(byteLength), true);

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const codeChallenge = new Uint8Array(
    await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, toUint8Array(encode(codeVerifier)))
  );
  return fromUint8Array(codeChallenge, true);
};
