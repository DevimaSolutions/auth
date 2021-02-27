export interface IStorage {
  setItem<T>(key: string, data: T): Promise<void>;
  setString(key: string, data: string): Promise<void>;
  getItem<T>(key: string): Promise<T>;
  getString(key: string): Promise<string>;
  remove(key: string): Promise<void>;
  multiSet<T extends Record<string, number | string | object>>(
    data: T
  ): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}
