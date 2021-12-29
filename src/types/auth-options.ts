import type { IStorage } from '../storage';
import type IAuthManager from './auth-manager';
import type { IAuthResult } from './signed-in-options';
import type { IAuthStorageKeys, IDefaultAuthStorageKeys } from './storage';
import type { AxiosInstance, AxiosResponse } from 'axios';

export default interface IAuthOptions<
  IUser,
  ISignInParams,
  IStorageKeys extends IAuthStorageKeys = IDefaultAuthStorageKeys,
> {
  signIn(
    signInParams: ISignInParams,
    manager: IAuthManager<IUser, ISignInParams>,
  ): Promise<AxiosResponse<IAuthResult>>;
  signOut(manager: IAuthManager<IUser, ISignInParams>): Promise<void>;
  refreshToken(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IAuthResult>>;
  getUser(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IUser>>;

  // Optional parameters
  axiosInstance?: AxiosInstance;
  storage?: IStorage;
  buildAuthorizationHeader?(manager: IAuthManager<IUser, ISignInParams>): string | null;
  storageKeys?: IStorageKeys;
}
