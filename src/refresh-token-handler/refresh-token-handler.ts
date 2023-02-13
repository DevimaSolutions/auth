import { authRetryAxiosRequestConfigFlag } from '../constants';

import type {
  IRefreshTokenHandler,
  IRefreshTokenHandlerParams,
  ISetupInterceptorParams,
} from './types';
import type { AxiosError, AxiosInstance } from 'axios';

export default class RefreshTokenHandler<IUser, ISignInParams> implements IRefreshTokenHandler {
  private _tokenRefreshPromise: Promise<void> | null = null;

  private _axios: AxiosInstance;

  private _interceptorId: number | null = null;

  protected _bindExternalMethods() {
    this.updateAuthHeader = this.updateAuthHeader.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  constructor({ axiosInstance, ...params }: IRefreshTokenHandlerParams<IUser, ISignInParams>) {
    this._bindExternalMethods();

    this._axios = axiosInstance;

    this._setAuthInterceptor(params);
  }

  protected _onRejectedInterceptor(params: ISetupInterceptorParams<IUser, ISignInParams>) {
    return async (error: AxiosError) => {
      const isRetryRequest = error.config?.internalData?.[authRetryAxiosRequestConfigFlag];
      const shouldSignOut =
        isRetryRequest || !error.response || error.response.status !== 401 || !params.isSignedIn();

      if (shouldSignOut) {
        return Promise.reject(error);
      }

      try {
        // Refresh token and try again
        if (!this._tokenRefreshPromise) {
          this._tokenRefreshPromise = params.forceRefreshToken();
        }

        // await existing token refresh if it is in progress
        await this._tokenRefreshPromise;
        this._tokenRefreshPromise = null;

        // Update auth header and retry request
        const authHeader = params.getAuthorizationHeader();
        if (!authHeader) {
          return await Promise.reject(error);
        }

        error.config = {
          ...error.config,
          // Mark this request as a retry to not trigger interceptor on it's response

          internalData: {
            [authRetryAxiosRequestConfigFlag]: true,
          },
          headers: {
            ...error.config?.headers,
            authorization: authHeader,
          },
        };

        return await this._axios.request(error.config);
      } catch {
        // Refresh token failed return original response
        await params.signOut();
        return Promise.reject(error);
      }
    };
  }

  protected _setAuthInterceptor(params: ISetupInterceptorParams<IUser, ISignInParams>) {
    this._interceptorId = this._axios.interceptors.response.use(
      (response) => response,
      this._onRejectedInterceptor(params),
    );
  }

  updateAuthHeader(authorizationHeader: string | null) {
    if (authorizationHeader) {
      this._axios.defaults.headers.common = {
        ...this._axios.defaults.headers.common,
        authorization: authorizationHeader,
      };
    } else {
      delete this._axios.defaults.headers.common.authorization;
    }
  }

  dispose() {
    if (this._interceptorId != null) {
      this._axios.interceptors.response.eject(this._interceptorId);
      this._interceptorId = null;
    }
  }
}
