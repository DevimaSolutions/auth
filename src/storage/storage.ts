import AsyncStorage from '@react-native-async-storage/async-storage';

import type { IStorage } from './storage.types';

export default class Storage implements IStorage {
  private _normalizeData<T>(data: T): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  private _denormalizeData<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error('Value is not an object');
    }
  }

  remove = AsyncStorage.removeItem;
  multiRemove = AsyncStorage.multiRemove;

  async setItem<T>(key: string, data: T): Promise<void> {
    AsyncStorage.setItem(key, this._normalizeData(data));
  }

  async setString(key: string, data: string): Promise<void> {
    AsyncStorage.setItem(key, data);
  }

  async getItem<T>(key: string): Promise<T> {
    const value = await AsyncStorage.getItem(key);

    if (!value) {
      throw new Error('Value not set');
    }

    return this._denormalizeData<T>(value);
  }

  async getString(key: string): Promise<string> {
    const value = await AsyncStorage.getItem(key);

    if (!value) {
      throw new Error('Value not set');
    }

    return value;
  }

  async multiSet<T extends Record<string, number | string | object>>(
    data: T
  ): Promise<void> {
    const entries = Object.entries(data).map(([key, value]) => [
      key,
      this._normalizeData(value),
    ]);
    await AsyncStorage.multiSet(entries);
  }
}
