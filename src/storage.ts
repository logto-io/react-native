import type { Storage, StorageKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const logtoStorageItemKeyPrefix = `logto`;

export class RNStorage implements Storage {
  private readonly storageKey: string;

  constructor() {
    this.storageKey = `${logtoStorageItemKeyPrefix}`;
  }

  async getItem(key: StorageKey): Promise<Nullable<string>> {
    return await AsyncStorage.getItem(`${this.storageKey}:${key}`);
  }

  async setItem(key: StorageKey, value: string): Promise<void> {
    AsyncStorage.setItem(`${this.storageKey}:${key}`, value);
  }

  async removeItem(key: StorageKey): Promise<void> {
    AsyncStorage.removeItem(`${this.storageKey}:${key}`);
  }
}
