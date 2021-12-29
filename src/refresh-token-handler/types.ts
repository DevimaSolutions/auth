import type { IAuthManager } from '../types';
import type { AxiosInstance } from 'axios';

export interface ISetupInterceptorParams<IUser, ISignInParams> {
  forceRefreshToken: () => Promise<void>;
  getAuthorizationHeader: () => string | null;
  isSignedIn: () => boolean;
  signOut: () => Promise<IAuthManager<IUser, ISignInParams>>;
}

export interface IRefreshTokenHandlerParams<IUser, ISignInParams>
  extends ISetupInterceptorParams<IUser, ISignInParams> {
  axiosInstance: AxiosInstance;
}

export interface IRefreshTokenHandler {
  updateAuthHeader(authorizationHeader: string | null): void;
  dispose(): void;
}
