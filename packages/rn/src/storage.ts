import { type Storage } from '@logto/client/lib/shim';

export class MemoryStorage implements Storage<string> {
  storage = new Map<string, string>();

  async getItem(key: string) {
    return this.storage.get(key) ?? null;
  }

  async setItem(key: string, value: string) {
    this.storage.set(key, value);
  }

  async removeItem(key: string) {
    this.storage.delete(key);
  }
}
