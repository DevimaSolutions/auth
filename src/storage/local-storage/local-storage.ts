import type { IStorage } from '../types';

export default class MemoryStorage implements IStorage {
  private _data = new Map<string, unknown>();

  remove = (key: string) => {
    this._data.delete(key);
  };

  multiRemove = (keys: string[]) => {
    keys.forEach((key) => this._data.delete(key));
  };

  setItem<T>(key: string, data: T) {
    this._data.set(key, data);
  }

  getItem<T>(key: string): T {
    return this._data.get(key) as T;
  }

  multiSet<T>(data: T) {
    Object.entries(data).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }
}
