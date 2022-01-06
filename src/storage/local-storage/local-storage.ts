import type { IStorage } from '../types';

export default class LocalStorage implements IStorage {
  private _normalizeData<T>(data: T) {
    return JSON.stringify(data);
  }

  private _denormalizeData<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch {
      throw new Error('Value is not an object');
    }
  }

  remove = (key: string) => {
    localStorage.removeItem(key);
  };

  multiRemove = (keys: string[]) => {
    keys.forEach((key) => localStorage.removeItem(key));
  };

  setItem = <T>(key: string, data: T) => {
    localStorage.setItem(key, this._normalizeData(data));
  };

  getItem = <T>(key: string): T => {
    const value = localStorage.getItem(key);

    return this._denormalizeData<T>(value ?? '');
  };

  multiSet = <T>(data: T) => {
    Object.entries(data).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  };
}
