import Emitter, { IEmitter } from '../emitter';
import Storage, { IStorage } from '../storage';
import type {
  IAuth,
  AuthCallback,
  AuthCallbackUnsubscriber,
  IAuthOptions,
  IUser,
  IAuthResult,
} from 'src/types';
import { AuthEventName, AuthStorageKey } from './authBase.types';
import ApiError from '../apiError';
import { isClientErrorStatusCode } from '../utils/api.utils';
import type { AuthResponseCallback } from 'src/types/IAuth';

export default class AuthBase implements IAuth {
  private _pendingPromise: Promise<void> | null;
  private _isSignedIn: boolean;
  private _initialPendingPromise: Promise<void> | null = null;
  private _resolveInitialPending: () => void = () => {};
  private readonly _emitter: IEmitter;
  private readonly _storage: IStorage;
  protected readonly _options: IAuthOptions;

  get options(): IAuthOptions {
    return this._options;
  }

  protected constructor(options: IAuthOptions) {
    this._pendingPromise = null;
    this._isSignedIn = false;
    this._emitter = new Emitter();
    this._storage = new Storage();
    this._options = options;

    this._createInitialPending();

    this._tryRefreshToken();
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
        console.log('1', { initialPending: this._initialPendingPromise });
        this._emitter.emit(AuthEventName.OnPendingActionComplete, this);
        return;
      }

      await this.refreshToken(refreshToken);
    } catch (e) {
      // The refreshToken not set. return without refreshing
      return;
    } finally {
      this._resolveInitialPending();
      console.log('2', { initialPending: this._initialPendingPromise });
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

    this._emitter.emit(AuthEventName.OnAuthStateChanged, this);
    this._emitter.emit(AuthEventName.OnSignedOut, this);
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
      this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
      await this._pendingPromise;
    } catch (e) {
      throw e;
    } finally {
      this._pendingPromise = null;
      // TODO: refactor this
      if (this._initialPendingPromise === null) {
        this._emitter.emit(AuthEventName.OnPendingActionComplete, this);
      }
      this._emitter.emit(AuthEventName.OnPendingStateChanged, this);
    }
    return this;
  }

  private async _buildFetchParms(
    init?: RequestInit | undefined
  ): Promise<RequestInit | undefined> {
    const authToken = await this.getAuthToken();
    if (!authToken) {
      return init;
    }

    return {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
        'authorization': authToken,
      },
    };
  }

  private async _fetchWithAuthToken(
    input: RequestInfo,
    init?: RequestInit | undefined
  ): Promise<Response> {
    const params = await this._buildFetchParms(init);
    return fetch(input, params);
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
        let authResult: IAuthResult;

        try {
          authResult = await this._options.signIn(email, password);
        } catch (e) {
          if (e instanceof ApiError) {
            this._emitter.emit(AuthEventName.onAuthFailed, e.response);
          }
          throw e;
        }

        const { access_token, refresh_token, ...authData } = authResult;

        const user = await this._options.getUser(access_token);
        await this._storage.multiSet({
          [AuthStorageKey.AuthToken]: access_token,
          [AuthStorageKey.RefreshToken]: refresh_token,
          [AuthStorageKey.AuthData]: authData,
          [AuthStorageKey.User]: user,
        });

        this._isSignedIn = true;
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
        async () => {
          const authResult = await this._options.refreshToken(token);
          const { access_token, refresh_token, ...authData } = authResult;

          const user = await this._options.getUser(access_token);
          await this._storage.multiSet({
            [AuthStorageKey.AuthToken]: access_token,
            [AuthStorageKey.RefreshToken]: refresh_token,
            [AuthStorageKey.AuthData]: authData,
            [AuthStorageKey.User]: user,
          });

          this._isSignedIn = true;
          this._emitter.emit(AuthEventName.OnAuthStateChanged, this);
          this._emitter.emit(AuthEventName.OnTokenRefreshed, this);
          this._emitter.emit(AuthEventName.OnUserChanged, this);
        }
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        isClientErrorStatusCode(error.response.status)
      ) {
        await this._forceSignOut();
      }
      return this;
    }
  }

  /**
   *
   * @param input The path to the resource you want to fetch
   * @param init Options object
   *
   * @returns a `Promise` that resolves to the `Response` to that request,
   * whether it is successful or not
   *
   * @description This is a wrapper for the original `fetch` API. The wrapper
   * adds authrization header to the request and tries to refresh the access
   * token if `fetch` returned `401` status code.
   */
  async fetchAuthenticated(
    input: RequestInfo,
    init?: RequestInit | undefined
  ): Promise<Response> {
    const res = await this._fetchWithAuthToken(input, init);
    if (res.status !== 401 || !this.isSignedIn()) {
      return res;
    }

    try {
      await this._tryRefreshToken();
      return this._fetchWithAuthToken(input, init);
    } catch {
      // Refresh token failed return original response
      return res;
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
