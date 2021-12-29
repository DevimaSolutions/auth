export interface IStorage {
  setItem<T>(key: string, data: T): void;
  getItem<T>(key: string): T;
  remove(key: string): void;
  multiSet<T>(data: T): void;
  multiRemove(keys: string[]): void;
}
