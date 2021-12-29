import type { defaultAuthStorageKeys } from '../constants/storage';

export interface IAuthStorageKeys {
  accessToken: string;
  refreshToken: string;
  user: string;
}

export type IDefaultAuthStorageKeys = typeof defaultAuthStorageKeys;
