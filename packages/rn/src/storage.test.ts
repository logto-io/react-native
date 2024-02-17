import CryptoES from 'crypto-es';

import { SecureStorage } from './storage';

vitest.mock('expo-crypto', () => ({
  getRandomBytesAsync: async (byteLength: number) => {
    return new Uint8Array(byteLength).fill(0);
  },
}));

const asyncStore = new Map<string, string>();

vitest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (key: string) => {
      return asyncStore.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      asyncStore.set(key, value);
    },
    removeItem: (key: string) => {
      asyncStore.delete(key);
    },
  },
}));

const secureStore = new Map<string, string>();

vitest.mock('expo-secure-store', () => ({
  deleteItemAsync: (key: string) => {
    secureStore.delete(key);
  },
  getItemAsync: (key: string) => {
    return secureStore.get(key) ?? null;
  },
  setItemAsync: (key: string, value: string) => {
    secureStore.set(key, value);
  },
}));

describe('SecureStorage', () => {
  it('should be able to store and retrieve encrypted value', async () => {
    const storage = new SecureStorage('test');
    const key = 'key';
    const value = 'value';

    await storage.setItem(key, value);
    const result = await storage.getItem(key);
    expect(result).toBe(value);

    const encrypted = asyncStore.get('test.key');
    const encryptionKey = secureStore.get('test.key');
    expect(CryptoES.AES.decrypt(encrypted!, encryptionKey!).toString(CryptoES.enc.Utf8)).toBe(
      'value'
    );
  });
});
