import axios from 'axios';

import { defaultAuthStorageKeys } from '../constants/storage';
import { LocalStorage } from '../storage';

import type { IAuthOptions } from '../';
import type { IAuthManager } from '../types';

export const ensureAuthOptions = <IUser, ISignInParams>(
  options: IAuthOptions<IUser, ISignInParams>,
) => {
  // Some fields are wrapped into a function to create object
  // only if it was not provided in options (see fields `createStorage`, `createAxiosInstance`)
  const defaultOptions = {
    buildAuthorizationHeader: (manager: IAuthManager<IUser, ISignInParams>) => {
      const token = manager.getAccessToken();
      return token ? `Bearer ${token}` : null;
    },
    createStorage: () => new LocalStorage(),
    storageKeys: defaultAuthStorageKeys,
    createAxiosInstance: () =>
      axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
  };

  const ensureOptions: Required<IAuthOptions<IUser, ISignInParams>> = {
    ...options,
    buildAuthorizationHeader:
      options.buildAuthorizationHeader ?? defaultOptions.buildAuthorizationHeader,
    storage: options.storage ?? defaultOptions.createStorage(),
    storageKeys: options.storageKeys ?? defaultOptions.storageKeys,
    axiosInstance: options.axiosInstance ?? defaultOptions.createAxiosInstance(),
  };
  return ensureOptions;
};
