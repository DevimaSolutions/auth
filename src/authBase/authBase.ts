import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import Emitter, { IEmitter } from '../emitter';
import Storage, { IStorage } from '../storage';
import { AuthEventName, AuthStorageKey } from './authBase.types';
import { isClientErrorStatusCode } from '../utils/api.utils';
import SocketManager from '../socketManager';
import type { ISocketManager } from '../socketManager';
import type {
  IAuth,
  AuthCallback,
  AuthCallbackUnsubscriber,
  IAuthOptions,
  IUser,
  IAuthResult,
  AuthResponseCallback,
} from '../types';

export default class AuthBase implements IAuth {
  private _pendingPromise: Promise<void> | null;
  private _isSignedIn: boolean;
  private _initialPendingPromise: Promise<void> | null = null;
  private _resolveInitialPending: () => void = () => {};
  private readonly _emitter: IEmitter;
  private readonly _storage: IStorage;
  private readonly _socketManager: ISocketManager | null;
  protected readonly _options: Required<IAuthOptions>;

  get options(): Required<IAuthOptions> {
    return this._options;
  }

  /**
   * Exposes API for interactions with socket server
   */
  get socketManager(): ISocketManager {
    return this._socketManager!;
  }

  /**
   * Instance of axios you should use to perform authorized requests
   */
  get axios(): AxiosInstance {
    return this._options.axiosInstance;
  }

  protected constructor(options: IAuthOptions, isSignedIn?: boolean) {
    this._pendingPromise = null;
    this._isSignedIn = isSignedIn ?? false;
    this._emitter = new Emitter();
    this._storage = options.storage ?? new Storage();
    this._socketManager = options.useSocketManager
      ? new SocketManager(this)
      : null;

    this._options = {
      ...options,
      useSocketManager: options.useSocketManager ?? false,
      storage: this._storage,
      axiosInstance:
        options.axiosInstance ??
        axios.create({
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    };

    this._configAxios();

    this._forceSignOut = this._forceSignOut.bind(this);
    this._forceRefreshToken = this._forceRefreshToken.bind(this);
    this._updateAuthHeader = this._updateAuthHeader.bind(this);

    // Do not force refresh when isSignedIn is passed to construct the auth
    if (typeof isSignedIn === 'undefined') {
      this._createInitialPending();
      this._tryRefreshToken();
    }
  }

  private _updateAuthHeader(authToken?: string) {
    if (authToken) {
      this.axios.defaults.headers = {
        ...this.axios.defaults.headers,
        authorization: authToken,
      };
    } else {
      delete this.axios.defaults.headers.authorization;
    }
  }

  private _configAxios() {
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (
          !error.response ||
          !error.request ||
          error.response.status !== 401 ||
          !this.isSignedIn()
        ) {
          return Promise.reject(error);
        }

        try {
          // Refresh token and try again
          await this._withPendingPromise(
            () => this.isSignedIn(),
            async () => {
              const refreshToken = await this.getRefreshToken();
              if (!refreshToken) {
                throw new Error('Unauthenticated');
              }
              await this._forceRefreshToken(refreshToken);

              // Update auth header and retry request
              const newAuthToken = await this.getAuthToken();
              error.config.headers.authorization = newAuthToken;
            }
          );

          return this.axios.request(error.config);
        } catch {
          // Refresh token failed return original response
          await this.signOut();
          return Promise.reject(error);
        }
      }
    );
  }

  private _createInitialPending() {
    // TODO: find a smarter way to await for refreshToken promise
    this._initialPendingPromise = new Promise((resolve) => {
      this._resolveInitialPending = () => {
        resolve();
        this._initialPendingPromise = null;
      };
    });
  }

  private async _tryRefreshToken(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        this._resolveInitialPending();
        // TODO: refactor these emit hacks in _tryRefreshToken
        if (this._pendingPromise === null) {
          this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
        }
        this._emitter.emit(AuthEventName.OnPendingActionComplete, this);
        return;
      }

      await this._forceRefreshToken(refreshToken);
    } catch (e) {
      // The refreshToken not set. return without refreshing
      // But clear storage from invalid token
      await this._forceSignOut();
    } finally {
      this._resolveInitialPending();
      if (this._pendingPromise === null) {
        this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
      }
      this._emitter.emit(AuthEventName.OnPendingActionComplete, this);
    }
  }

  private _createSubscription(
    eventName: AuthEventName,
    callback: AuthCallback | AuthResponseCallback
  ): AuthCallbackUnsubscriber {
    this._emitter.addListener(eventName, callback);

    return () => {
      this._emitter.removeListener(eventName, callback);
    };
  }

  private _clearStorage() {
    return this._storage.multiRemove(Object.values(AuthStorageKey));
  }

  private async _forceSignOut() {
    const authToken = await this.getAuthToken();
    await this._clearStorage();
    this._isSignedIn = false;

    if (authToken) {
      await this._options.signOut(authToken);
    }

    this._updateAuthHeader();
    this._emitter.emit(AuthEventName.OnAuthStateChanged, this);
    this._emitter.emit(AuthEventName.OnSignedOut, this);
    this._emitter.emit(AuthEventName.OnUserChanged, this);
  }

  private async _forceRefreshToken(token: string) {
    const authResult = await this._options.refreshToken(token);
    const { access_token, refresh_token, ...authData } = authResult.data;

    const user = await this._options.getUser(access_token);
    await this._storage.multiSet({
      [AuthStorageKey.AuthToken]: access_token,
      [AuthStorageKey.RefreshToken]: refresh_token,
      [AuthStorageKey.AuthData]: authData,
      [AuthStorageKey.User]: user.data,
    });

    this._isSignedIn = true;
    this._updateAuthHeader(access_token);
    this._emitter.emit(AuthEventName.OnAuthStateChanged, this);
    this._emitter.emit(AuthEventName.OnTokenRefreshed, this);
    this._emitter.emit(AuthEventName.OnUserChanged, this);
  }

  /**
   * @param successAwaitingCondition If there is another operation in progress,
   * when it is finished the `successAwaitingCondition` check will be
   * performed. If the result is `true` the `wrappedFn` will not be executed.
   * @param wrappedFn is an async function to be wrapped with the
   * `_pendingPromise` `Promise`.
   */
  private async _withPendingPromise(
    successAwaitingCondition: () => boolean,
    wrappedFn: () => Promise<void>
  ): Promise<this> {
    if (this.isPending()) {
      await this._initialPendingPromise;
      await this._pendingPromise;

      if (successAwaitingCondition()) {
        return this;
      }
    }

    try {
      this._pendingPromise = new Promise<void>(async (resolve, reject) => {
        await wrappedFn().catch(reject);
        resolve();
      });

      if (this._initialPendingPromise !== null) {
        this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
      }
      await this._pendingPromise;
    } catch (e) {
      throw e;
    } finally {
      this._pendingPromise = null;
      this._emitter.emit(AuthEventName.OnPendingActionComplete, this);

      // TODO: refactor this
      if (this._initialPendingPromise === null) {
        this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
      }
    }
    return this;
  }

  /**
   * @description removes all active event listeners on this object.
   */
  dispose(): void {
    this._emitter.removeAllListeners();
  }

  /**
   * @returns `User` model if the user is logged in or `null` otherwise.
   */
  getUser<User extends IUser>(): Promise<User | null> {
    return this._storage.getItem<User>(AuthStorageKey.User).catch(() => null);
  }

  /**
   * @returns `authToken` if the user is logged in or `null` otherwise.
   */
  getAuthToken(): Promise<string | null> {
    return this._storage.getString(AuthStorageKey.AuthToken).catch(() => null);
  }

  /**
   * @returns `refreshToken` if the user is logged in or `null` otherwise.
   */
  getRefreshToken(): Promise<string | null> {
    return this._storage
      .getString(AuthStorageKey.RefreshToken)
      .catch(() => null);
  }

  /**
   *
   * @param user set of fields from the `User` model to be updated.
   *
   * @description Updates the user data in async storage. **Do not** perform API
   * request to update user on the Backend.
   */
  async updateUser<User extends IUser>(user: Partial<User>): Promise<this> {
    const oldUser = await this.getUser<User>();
    await this._storage.setItem(AuthStorageKey.User, {
      ...(oldUser || {}),
      ...user,
    });
    return this;
  }

  /**
   * @returns `true` if there is pending action.
   */
  isPending(): boolean {
    return (
      this._pendingPromise !== null || this._initialPendingPromise !== null
    );
  }

  /**
   * @returns `true` if the user is signed in.
   */
  isSignedIn(): boolean {
    return this._isSignedIn;
  }

  /**
   *
   * @param email User's email
   * @param password User's password
   *
   * @description This method will call the `signIn` method from `IAuthOptions`
   * and then save the authentication token and get the user information.
   * All received data is stored in the `AsyncStorage`.
   */
  signIn(email: string, password: string): Promise<this> {
    return this._withPendingPromise(
      () => this._isSignedIn,
      async () => {
        let authResult: AxiosResponse<IAuthResult>;

        try {
          authResult = await this._options.signIn(email, password);
        } catch (e) {
          this._emitter.emit(AuthEventName.onAuthFailed, e.response);
          throw e;
        }

        const { access_token, refresh_token, ...authData } = authResult.data;

        const user = await this._options.getUser(access_token);
        await this._storage.multiSet({
          [AuthStorageKey.AuthToken]: access_token,
          [AuthStorageKey.RefreshToken]: refresh_token,
          [AuthStorageKey.AuthData]: authData,
          [AuthStorageKey.User]: user.data,
        });

        this._isSignedIn = true;
        this._updateAuthHeader(access_token);
        this._emitter.emit(AuthEventName.OnAuthStateChanged, this);
        this._emitter.emit(AuthEventName.OnSignedIn, this);
        this._emitter.emit(AuthEventName.OnUserChanged, this);
      }
    );
  }

  /**
   * @description This method will call the `signOut` method from `IAuthOptions`
   * and then clear the authentication token and get all user information
   * from the `AsyncStorage`.
   */
  signOut(): Promise<this> {
    return this._withPendingPromise(
      () => !this._isSignedIn,
      this._forceSignOut
    );
  }

  /**
   *
   * @param token The `refreshToken` string. (You should usually get it using
   * `this.getRefreshToken()` method)
   *
   */
  async refreshToken(token: string): Promise<this> {
    try {
      return this._withPendingPromise(
        () => this._isSignedIn,
        () => this._forceRefreshToken(token)
      );
    } catch (error) {
      if (isClientErrorStatusCode(error.response?.status)) {
        await this._forceSignOut();
      }
      return this;
    }
  }

  onSignedIn(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.OnSignedIn, callback);
  }
  onSignedOut(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.OnSignedOut, callback);
  }
  onTokenRefreshed(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.OnTokenRefreshed, callback);
  }
  onUserChanged(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.OnUserChanged, callback);
  }
  onAuthStateChanged(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.OnAuthStateChanged, callback);
  }
  onAuthFailed(callback: AuthResponseCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onAuthFailed, callback);
  }
  onPendingStateChanged(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(
      AuthEventName.OnPendingStateChanged,
      callback
    );
  }
  oncePendingActionComplete(callback: AuthCallback): AuthCallbackUnsubscriber {
    // Execute callback immedediately if there is no pending promise.
    if (!this.isPending()) {
      callback(this);
      return () => {};
    }

    const onceWrapper = this._emitter.once(
      AuthEventName.OnPendingActionComplete,
      callback
    );
    return () => {
      this._emitter.removeListener(
        AuthEventName.OnPendingActionComplete,
        onceWrapper
      );
    };
  }
}
