import { type Storage } from '@logto/client/shim';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoES from 'crypto-es';
import * as SecureStore from 'expo-secure-store';

import { generateRandomString } from './utils';

export class SecureStorage implements Storage<string> {
  constructor(public id: string) {}

  getStorageKey(key: string) {
    return `${this.id}.${key}`;
  }

  async getItem(key: string) {
    const storageKey = this.getStorageKey(key);
    const encrypted = await AsyncStorage.getItem(storageKey);

    if (!encrypted) {
      return null;
    }

    return this.#decrypt(storageKey, encrypted);
  }

  async setItem(key: string, value: string) {
    const storageKey = this.getStorageKey(key);
    const encrypted = await this.#encrypt(storageKey, value);
    await AsyncStorage.setItem(storageKey, encrypted);
  }

  async removeItem(key: string) {
    const storageKey = this.getStorageKey(key);
    await Promise.all([
      AsyncStorage.removeItem(storageKey),
      SecureStore.deleteItemAsync(storageKey),
    ]);
  }

  async #encrypt(key: string, value: string) {
    const encryptionKey = await generateRandomString();
    const encrypted = CryptoES.AES.encrypt(value, encryptionKey).toString();

    await SecureStore.setItemAsync(key, encryptionKey);
    return encrypted;
  }

  async #decrypt(key: string, value: string) {
    const encryptionKey = await SecureStore.getItemAsync(key);

    if (!encryptionKey) {
      return null;
    }

    return CryptoES.AES.decrypt(value, encryptionKey).toString(CryptoES.enc.Utf8);
  }
}
