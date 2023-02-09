import type { IStorage } from '../storage';
import type IAuthManager from './auth-manager';
import type { IAuthResult } from './signed-in-options';
import type { IAuthStorageKeys, IDefaultAuthStorageKeys } from './storage';
import type { AxiosInstance, AxiosResponse } from 'axios';

export interface IAuthOptions<
  IUser,
  ISignInParams,
  IStorageKeys extends IAuthStorageKeys = IDefaultAuthStorageKeys,
> {
  signIn(
    signInParams: ISignInParams,
    manager: IAuthManager<IUser, ISignInParams>,
  ): Promise<AxiosResponse<IAuthResult>>;
  refreshToken(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IAuthResult>>;
  getUser(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IUser>>;

  // Optional parameters
  signOut?(manager: IAuthManager<IUser, ISignInParams>): Promise<void>;
  // axios instance passed here will be a base for `manager.axios` you will use further
  // usually it is enough to set base url here and content type. But if your server require
  // any additional configuration to perform api request it can be done here
  // after library initialization response interceptor will be added
  /**
   * @description axios instance passed here will be a base for `authManager.axios` you will use further
   * usually it is enough to set base url and content type here. But if your server requires
   * any additional configuration to perform api request it can be done here.
   *
   * After library initialization response interceptor will be added to this axios instance.
   * This interceptor will try to refresh the `accessToken` if user is signed in and request returned
   * 401 (Unauthorized) status code.
   * @default axios.create({ headers: { 'Content-Type': 'application/json' } })
   */
  axiosInstance?: AxiosInstance;
  storage?: IStorage;
  buildAuthorizationHeader?(manager: IAuthManager<IUser, ISignInParams>): string | null;
  storageKeys?: IStorageKeys;
}

export interface IAuthFactoryOptions {
  /**
   * @description When set to true, forces getAuthManager call to refresh user token in case it create new auth manager.
   * This may be useful to initialize authManager on SPA startup and make sure user have access to the page.
   */
  refreshTokenOnInit?: boolean;
}

export interface IGlobalAuthOptions<
  IUser,
  ISignInParams,
  IStorageKeys extends IAuthStorageKeys = IDefaultAuthStorageKeys,
> extends IAuthOptions<IUser, ISignInParams, IStorageKeys>,
    IAuthFactoryOptions {}
